const User = require("../models/user");
const Concert = require("../models/concert");
const Repetition = require("../models/repetition");
const Saison = require("../models/saison");
const Pupitre = require("../models/pupitre");
const HistoriqueStatut = require("../models/historiqueStatus");
const Oeuvre = require("../models/oueuvre");
const { envoyerEmail } = require("../utils/disponibiliteMail");
const { format } = require("date-fns");
const { isSameDay, parseDate } = require("../utils/date");
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ payload: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ payload: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateUserById = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    console.log(updatedUser);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ payload: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const presenceConcert = async (req, res) => {
  try {
    const { code } = req.body;
    const concert = await Concert.findOne({ "qrCode.code": code });

    if (!concert) {
      return res.status(404).json({ message: "Qr code invalide" });
    }

    const userId = req.auth.userId;
    const user = await User.findById(userId);

    const concertUser = user.Concerts.find(
      (c) => c.Concert && c.Concert.toString() === concert._id.toString()
    );
    if (!concertUser) {
      return res
        .status(404)
        .json({ message: "Utilisateur non concerné par ce concert" });
    }

    console.log(concertUser);

    concertUser.presence = true;
    await user.save();

    res.status(200).json({ message: "Utilisateur présent" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const presenceRepitition = async (req, res) => {
  try {
    const { code } = req.body;
    const repetition = await Repetition.findOne({ "qrCode.code": code }).exec();
    if (!repetition) {
      res.status(404).json({ message: "Qr code invalide" });
    }
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    const repetitionUser = user.Repetitions.find(
      (c) => c.repetition.toString() === repetition._id.toString()
    );
    if (!repetition) {
      res.status(404).json({ message: "user non concerné" });
    }
    console.log(userId);

    repetitionUser.presence = true;
    await user.save();
    res.status(200).json({ message: "utilisateur present" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const consulterStatut = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      userId: user._id,
      nom: user.nom,
      prenom: user.prenom,
      status: user.status,
      niveauExperience: user.niveauExperience,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const consulterHistoriqueStatut = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const dateIntegrationUser = new Date(user.createdAt);
    const saisonActuelle = await Saison.findOne().sort({ dateDebut: -1 });
    const historiqueStatut = [];

    const yearsSinceIntegration =
      new Date().getFullYear() - dateIntegrationUser.getFullYear();

    for (
      let annee = dateIntegrationUser.getFullYear();
      annee <= saisonActuelle.dateDebut.getFullYear();
      annee++
    ) {
      const yearsSinceIntegration = annee - dateIntegrationUser.getFullYear();
      let niveauExperience = "Inactif";

      if (yearsSinceIntegration === 0) {
        niveauExperience = "Choriste Junior";
      } else if (yearsSinceIntegration === 1) {
        niveauExperience = "Choriste";
      } else if (yearsSinceIntegration >= 2) {
        niveauExperience = "Senior";
      }

      if (
        dateIntegrationUser.getFullYear() === 2018 &&
        yearsSinceIntegration >= 0
      ) {
        niveauExperience = "Vétéran";
      }

      historiqueStatut.push({
        dateDebut_année_de_la_saison: annee,
        niveauExperience: niveauExperience,
      });
    }

    // save db
    const existingHistoriqueStatut = await HistoriqueStatut.findOne({
      user: user._id,
    });

    if (existingHistoriqueStatut) {
      existingHistoriqueStatut.yearsAndStatus = historiqueStatut;
      await existingHistoriqueStatut.save();
      res.status(200).json({
        success: true,
        message: `Historique - Statut du : ${user.nom} ${user.prenom}`,
        data: historiqueStatut,
      });
    } else {
      await HistoriqueStatut.create({
        user: user._id,
        yearsAndStatus: historiqueStatut,
      });
      res.status(201).json({
        success: true,
        message: "HistoriqueStatut créé avec succès",
        data: historiqueStatut,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de l'enregistrement de l'historique",
    });
  }
};
const consulterProfil = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const saison = await Saison.findOne();
    const listeElimines = saison.ListeDesElimines;
    const listeNomines = saison.ListeDesNomines;

    const isEliminated = saison.ListeDesElimines.includes(userId);
    const isNominated = saison.ListeDesNomines.includes(userId);

    const historicalStatus = await HistoriqueStatut.findOne({ user: userId });

    const responseData = {
      user: user.toObject(),
      historicalStatus: historicalStatus ? historicalStatus.yearsAndStatus : [],
      isEliminated: isEliminated,
      isNominated: isNominated,
      listeNomines: listeNomines,
      listeElimines: listeElimines,
    };

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
const eliminerChoristeDicipline = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (user.role !== "choriste") {
      return res.status(400).json({
        success: false,
        error: "User is not a choriste and cannot be eliminated",
      });
    }

    const saison = await Saison.findOne();

    const isEliminated = saison.ListeDesElimines.some(
      (elimine) => elimine.choriste.toString() === userId
    );

    const isNominated = saison.ListeDesNomines.includes(userId);

    if (isEliminated) {
      return res
        .status(400)
        .json({ success: false, error: "User already eliminated" });
    }

    if (isNominated) {
      return res.status(400).json({
        success: false,
        error: "User is nominated and cannot be eliminated",
      });
    }

    saison.ListeDesElimines.push({
      choriste: userId,
      raison: "Raison disciplinaire",
      dateElimination: Date.now(),
      dateFinElimination: new Date(
        Date.now() + saison.dureeElimination * 24 * 60 * 60 * 1000
      ),
    });

    await saison.save();

    return res
      .status(200)
      .json({ success: true, message: "User eliminated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
const indiquerDisponibilite = async (req, res) => {
  try {
    const idConcert = req.params.id;
    const { disponibilite } = req.body;

    const userId = req.auth.userId;
    const user = await User.findById(userId);

    const concertUser = user.Concerts.find(
      (c) => c.Concert && c.Concert.toString() === idConcert
    );

    if (!concertUser) {
      return res.status(404).json({ message: "User non concerné" });
    }

    concertUser.disponibilite = disponibilite;
    await user.save();

    if (disponibilite) {
      await envoyerEmail(user);
      return res
        .status(200)
        .json({ message: "Utilisateur confirme sa présence au concert" });
    } else {
      return res
        .status(200)
        .json({ message: "Utilisateur confirme son absence au concert" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const getListesChoristesDisponibles = async (req, res) => {
  try {
    const idConcert = req.params.id;
    const pupitreFilter = req.query.pupitre;

    const concert = await Concert.findById(idConcert);

    if (!concert) {
      return res.status(404).json({ error: "Concert non trouvé" });
    }

    let query = {
      role: "choriste",
      "Concerts.disponibilite": true,
    };

    if (pupitreFilter) {
      const pupitre = await Pupitre.findOne({ type_voix: pupitreFilter });
      if (pupitre) {
        const membresPupitreIds = pupitre.membres.map((member) =>
          member.toString()
        );
        query._id = { $in: membresPupitreIds };
      } else {
        return res.status(404).json({ error: "Pupitre non trouvé" });
      }
    }

    const choristes = await User.find(query);

    const choristesDisponibles = choristes
      .filter((choriste) =>
        choriste.Concerts.some(
          (concert) =>
            concert.Concert.toString() === idConcert &&
            concert.disponibilite === true
        )
      )
      .map(({ prenom, nom, telephone, email }) => ({
        prenom,
        nom,
        telephone,
        email,
      }));

    res.json({ choristes: choristesDisponibles });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des choristes disponibles :",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getListeAbsenceChoriste = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const choristeId = req.params.choristeId;
    const choriste = await User.findById(choristeId);

    if (!choriste || choriste.role !== "choriste") {
      return res.status(404).json({
        message: "Choriste not found or the role of the user is not 'Choriste'",
      });
    }

    const absencesConcerts = choriste.Concerts.reduce(
      (absencesArray, concert) => {
        if (!concert.presence) {
          absencesArray.push({
            Id_concert: concert.Concert._id,
          });
        }
        return absencesArray;
      },
      []
    );

    const absencesRepetitions = choriste.Repetitions.reduce(
      (absencesArray, repetition) => {
        if (!repetition.presence) {
          absencesArray.push({
            Id_repetition: repetition.repetition._id,
          });
        }
        return absencesArray;
      },
      []
    );

    let nombreAbsencesTotal =
      choriste.Concerts.filter((concert) => !concert.presence).length +
      choriste.Repetitions.filter((repetition) => !repetition.presence).length;
    let nombreAbsencesConcerts = absencesConcerts.length;
    let nombreAbsencesRepetitions = absencesRepetitions.length;

    choriste.nb_absence_total = nombreAbsencesTotal;
    await choriste.save();
    ////////// a la fin de chaque saison il ya réinitialisation de nombre d'absences pour chaque choriste
    const saison = await Saison.findOne({ dateFin: { $lt: new Date() } }); // trouver la saison par la date fin
    if (saison) {
      choriste.nb_absence_total = 0;
      nombreAbsencesConcerts = 0;
      nombreAbsencesRepetitions = 0;
      nombreAbsencesTotal = 0;
      await choriste.save();
    }
    ////////////
    //// recalcul des donnees///
    nombreAbsencesTotal =
      choriste.Concerts.filter((concert) => !concert.presence).length +
      choriste.Repetitions.filter((repetition) => !repetition.presence).length;
    nombreAbsencesConcerts = absencesConcerts.length;
    nombreAbsencesRepetitions = absencesRepetitions.length;
    choriste.nb_absence_total = nombreAbsencesTotal;
    await choriste.save();

    choriste.nb_absence_total = nombreAbsencesTotal;
    res.status(200).json({
      choristeId: choriste._id,
      nombreAbsencesTotal: nombreAbsencesTotal,
      nombreAbsencesConcerts: nombreAbsencesConcerts,
      nombreAbsencesRepetitions: nombreAbsencesRepetitions,
      absencesConcerts: absencesConcerts,
      absencesRepetitions: absencesRepetitions,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching absence count for choriste" });
  }
};
const indiquerPresenceManuelleRep = async (req, res) => {
  try {
    const { userId, repetitionId, raison } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Choriste non trouvé" });
    }

    const repetitionUser = user.Repetitions.find(
      (c) => c.repetition.toString() == repetitionId
    );

    if (!repetitionUser) {
      return res
        .status(404)
        .json({ message: "Répétition non associée à ce choriste" });
    }

    repetitionUser.presence = true;
    repetitionUser.raison = raison || "Présence manuelle";

    await user.save();
    res
      .status(200)
      .json({ message: "Présence à la répétition ajoutée avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout de la présence à la répétition :",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};
const indiquerPresenceManuelleCon = async (req, res) => {
  try {
    const { userId, concertId, raison } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Choriste non trouvé" });
    }

    const concertUser = user.Concerts.find(
      (c) => c.Concert.toString() == concertId
    );

    if (!concertUser) {
      return res
        .status(404)
        .json({ message: "Concert non associée à ce choriste" });
    }

    concertUser.presence = true;
    concertUser.raison = raison || "Présence manuelle";

    await user.save();
    res
      .status(200)
      .json({ message: "Présence à la Concert ajoutée avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout de la présence à la Concert :",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};
const getUserActivityHistory = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);
    const saisonId = req.query.saison;
    const oeuvreId = req.query.oeuvre;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalRepetitions = user.Repetitions.length;
    const totalConcerts = user.Concerts.length;

    const repetitionsHistory = await Promise.all(
      user.Repetitions.map(async (repetition) => {
        const repetitionData = await Repetition.findById(repetition.repetition);
        return {
          date: repetitionData ? repetitionData.date : null,
          lieu: repetitionData ? repetitionData.lieu : null,
        };
      })
    );

    const concerts = await Promise.all(
      user.Concerts.map(async (concert) => {
        const concertDetails = await Concert.findById(concert.Concert);
        if (!concertDetails) {
          return null;
        }

        if (saisonId && concertDetails.saison != saisonId) {
          return null;
        }

        if (oeuvreId && !concertDetails.programme.includes(oeuvreId)) {
          return null;
        }

        const oueuvres = await Promise.all(
          concertDetails.programme.map(async (oeuvre) => {
            const oeuvreData = await Oeuvre.findById(oeuvre);
            return {
              title: oeuvreData ? oeuvreData.titre : "Unknown Title",
            };
          })
        );

        const saisonData = await Saison.findById(concertDetails.saison);
        const saisonName = saisonData ? saisonData.nom : "Unknown Season";

        return {
          nom: concertDetails.nom,
          date: concertDetails.date,
          lieu: concertDetails.lieu,
          saison: saisonName,
          oueuvres,
        };
      })
    );

    const filteredConcerts = concerts.filter((concert) => concert !== null);

    const activityHistory = {
      totalRepetitions,
      totalConcerts,
      repetitionsHistory,
      concerts: filteredConcerts,
    };

    res.json({ activityHistory });
  } catch (error) {
    console.error("Error fetching user activity history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllUserActivityHistory = async (req, res) => {
  try {
    const userIdFilter = req.query.id;
    const saisonId = req.query.saison;
    const oeuvreId = req.query.oeuvre;

    const users = userIdFilter
      ? [await User.findById(userIdFilter)]
      : await User.find();

    const activityHistories = await Promise.all(
      users.map(async (user) => {
        if (!user) {
          return null; // User not found
        }

        const totalRepetitions = user.Repetitions.length;
        const totalConcerts = user.Concerts.length;

        const repetitionsHistory = await Promise.all(
          user.Repetitions.map(async (repetition) => {
            const repetitionData = await Repetition.findById(
              repetition.repetition
            );
            return {
              date: repetitionData ? repetitionData.date : null,
              lieu: repetitionData ? repetitionData.lieu : null,
            };
          })
        );

        const concerts = await Promise.all(
          user.Concerts.map(async (concert) => {
            const concertDetails = await Concert.findById(concert.Concert);
            if (!concertDetails) {
              return null;
            }

            if (saisonId && concertDetails.saison != saisonId) {
              return null;
            }

            if (oeuvreId && !concertDetails.programme.includes(oeuvreId)) {
              return null;
            }

            const oueuvres = await Promise.all(
              concertDetails.programme.map(async (oeuvre) => {
                const oeuvreData = await Oeuvre.findById(oeuvre);
                return {
                  title: oeuvreData ? oeuvreData.titre : "Unknown Title",
                };
              })
            );

            const saisonData = await Saison.findById(concertDetails.saison);
            const saisonName = saisonData ? saisonData.nom : "Unknown Season";

            return {
              nom: concertDetails.nom,
              date: concertDetails.date,
              lieu: concertDetails.lieu,
              saison: saisonName,
              oueuvres,
            };
          })
        );

        const filteredConcerts = concerts.filter((concert) => concert !== null);

        return {
          userId: user._id,
          firstName: user.firstName, // Add firstName
          lastName: user.lastName, // Add lastName
          totalRepetitions,
          totalConcerts,
          repetitionsHistory,
          concerts: filteredConcerts,
        };
      })
    );

    res.json({ activityHistories });
  } catch (error) {
    console.error("Error fetching user activity history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const placementConcert = async (req, res) => {
  try {
    const { placement, concertId, userId } = req.body;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: "Concert not found !" });
    }

    const user = await User.findById(userId);

    const concertUser = user.Concerts.find(
      (c) => c.Concert && c.Concert.toString() === concert._id.toString()
    );
    if (!concertUser) {
      return res.status(404).json({ message: "User not concerned !" });
    }

    concertUser.placement = placement;
    await user.save();

    res.status(200).json({ message: "sccess !" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getListeAbsenceRepetitions = async (req, res) => {
  try {
    const users = await User.find();
    const saisonId = req.query.saison;
    const dateFilter = req.query.date;
    const userIdFilter = req.query.id;
    const pupitreFilter = req.query.pupitre;
    const oeuvreIdFilter = req.query.oeuvre;

    const absencesRepetitionsMap = new Map();

    for (const user of users) {
      if (userIdFilter && user._id.toString() !== userIdFilter) {
        continue;
      }

      const absencesUser = user.Repetitions.filter(
        (repetition) => !repetition.presence
      );

      for (const absence of absencesUser) {
        const repetitionData = await Repetition.findById(absence.repetition)
          .populate({
            path: "concert",
            model: "Concert",
            populate: [
              {
                path: "saison",
                model: "Saison",
              },
              {
                path: "programme",
                model: "Oeuvre",
              },
            ],
          })
          .exec();

        if (
          repetitionData &&
          (!saisonId ||
            (repetitionData.concert &&
              repetitionData.concert.saison &&
              repetitionData.concert.saison._id.toString() === saisonId)) &&
          (!dateFilter ||
            isSameDay(new Date(repetitionData.date), parseDate(dateFilter)))
        ) {
          const formattedDate = format(
            new Date(repetitionData.date),
            "dd/MM/yyyy"
          );

          if (pupitreFilter) {
            const pupitre = await Pupitre.findOne({ type_voix: pupitreFilter });
            if (pupitre) {
              const membresPupitreIds = pupitre.membres.map((member) =>
                member.toString()
              );
              if (!membresPupitreIds.includes(user._id.toString())) {
                continue;
              }
            }
          }

          const pupitreData = await Pupitre.findOne({ membres: user._id });

          const repetitionKey = repetitionData._id.toString();

          if (!absencesRepetitionsMap.has(repetitionKey)) {
            const programmeOeuvres = repetitionData.concert.programme.map(
              (oeuvre) => ({
                id: oeuvre._id,
                nom: oeuvre.titre,
                compositeur: oeuvre.compositeur,
              })
            );

            absencesRepetitionsMap.set(repetitionKey, {
              Id_repetition: repetitionData._id,
              dateRepetition: formattedDate,
              lieu: repetitionData.lieu,
              concert: {
                nom: repetitionData.concert.nom,
                saison:
                  repetitionData.concert.saison &&
                  repetitionData.concert.saison.nom
                    ? repetitionData.concert.saison.nom
                    : "Non définie",
                programmeOeuvres: programmeOeuvres,
              },
              countAbsences: 0,
              absences: [],
            });
          }

          const existingRepetition = absencesRepetitionsMap.get(repetitionKey);

          const countAbsences = await User.countDocuments({
            _id: user._id,
            "Repetitions.repetition": absence.repetition,
            "Repetitions.presence": false,
          });

          existingRepetition.countAbsences += countAbsences;

          existingRepetition.absences.push({
            userId: user._id,
            nom: user.nom,
            prenom: user.prenom,
            raison: absence.raison,
            pupitre: pupitreData ? pupitreData.type_voix : "Non défini",
          });
        }
      }
    }

    if (oeuvreIdFilter) {
      const filteredAbsencesRepetitions = [
        ...absencesRepetitionsMap.values(),
      ].filter((repetition) =>
        repetition.concert.programmeOeuvres.some(
          (oeuvre) => oeuvre.id == oeuvreIdFilter
        )
      );
      res.status(200).json({
        absencesRepetitions: filteredAbsencesRepetitions,
      });
    } else {
      const absencesRepetitions = [...absencesRepetitionsMap.values()];
      res.status(200).json({
        absencesRepetitions: absencesRepetitions,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching absence count for users" });
  }
};

const statistiqueParChoriste = async (req, res) => {
  try {
    const choristes = await User.find({ role: "choriste" });
    const concerts = await Concert.find();

    const statistiquesChoristes = [];

    for (const choriste of choristes) {
      const statistiqueChoriste = {
        idUtilisateur: choriste._id,
        nomUtilisateur: `${choriste.nom} ${choriste.prenom}`,
        totalRepetitions: 0,
        totalPresenceRepetitions: 0,
        totalAbsenceRepetitions: 0,
        totalPresenceConcerts: 0,
        totalAbsenceConcerts: 0,
        totalConcerts: 0,
      };

      for (const concert of concerts) {
        const repetitions = await Repetition.find({
          concert: concert._id,
          "presence.userId": choriste._id,
        });

        const nombreTotalRepetitions = repetitions.length;
        const nombrePresenceRepetitions = repetitions.filter((rep) =>
          rep.presence.find(
            (p) => p.userId.toString() === choriste._id.toString() && p.present
          )
        ).length;
        const nombreAbsenceRepetitions =
          nombreTotalRepetitions - nombrePresenceRepetitions;

        statistiqueChoriste.totalRepetitions += nombreTotalRepetitions;
        statistiqueChoriste.totalPresenceRepetitions +=
          nombrePresenceRepetitions;
        statistiqueChoriste.totalAbsenceRepetitions += nombreAbsenceRepetitions;

        const usersConcert = choriste.Concerts.find(
          (c) => c.Concert.toString() === concert._id.toString()
        );

        if (usersConcert) {
          statistiqueChoriste.totalConcerts++;

          if (usersConcert.presence) {
            statistiqueChoriste.totalPresenceConcerts++;
          } else {
            statistiqueChoriste.totalAbsenceConcerts++;
          }
        }
      }

      statistiquesChoristes.push(statistiqueChoriste);
    }

    res.status(200).json({ statistiquesChoristes });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur lors du calcul des statistiques par choriste pour les concerts",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  presenceRepitition,
  presenceConcert,
  consulterStatut,
  consulterHistoriqueStatut,
  indiquerDisponibilite,
  getListesChoristesDisponibles,
  getListeAbsenceChoriste,
  indiquerPresenceManuelleRep,
  indiquerPresenceManuelleCon,
  placementConcert,
  getUserActivityHistory,
  getAllUserActivityHistory,
  consulterProfil,
  eliminerChoristeDicipline,
  getListeAbsenceRepetitions,
  statistiqueParChoriste,
};
