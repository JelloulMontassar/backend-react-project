const Concert = require("../models/concert");
const xlsx = require("xlsx");
const Oeuvre = require("../models/oueuvre");
const Saison = require("../models/saison");
const User = require("../models/user");
const Repetition = require("../models/repetition");

const {
  genererQrCodeAleatoire,
  isQRCodeUnique,
} = require("../utils/genererQrCode");

const addConcert = async (req, res, next) => {
  try {
    // Vérifier si la saison existe

    const concert = new Concert({
      nom: req.body.nom,
      date: req.body.date,
      nom: req.body.nom,
      saison: req.body.saison,
      heure: req.body.heure,
      lieu: req.body.lieu,
      previsions: req.body.previsions,
      repetitions: req.body.repetitions,
      programme: req.body.programme,
    });
    if (req.file) {
      concert.affiche = req.file.filename;
    }
    const concerts = await Concert.find();

    let imageQr, codeQR;

    do {
      [imageQr, codeQR] = await genererQrCodeAleatoire();
    } while (!isQRCodeUnique(codeQR, concerts));

    concert.qrCode.code = codeQR;
    concert.qrCode.image = imageQr;

    // valide le modele
    await concert.validate();

    // save le modele s il passe la validation
    await concert.save();
    /////////// add concert id dans liste choristes
    const choristes = await User.find({ role: "choriste" });

    for (const choriste of choristes) {
      choriste.Concerts.push({
        Concert: concert._id,
      });
      await choriste.save();
    }
    await concert.populate("saison");
    res.status(200).json({
      message: "L'ajout du Concert est effectué avec succès",
      payload: concert,
    });
    console.log(req.file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du Concert" });
  }
};
const getConcert = async (req, res, next) => {
  try {
    const concertId = req.params.id;

    const concert = await Concert.findById(concertId).populate("saison");
    if (!concert) {
      return res.status(404).json({ message: "Concert non trouvée" });
    }
    res.status(201).json({
      message: "L'affichage du Concert est effectué avec succès",
      concert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'affichage du Concert" });
  }
};
const getConcerts = async (req, res, next) => {
  try {
    const concerts = await Concert.find({}).populate("saison");
    res.status(200).json({
      message: "L'affichage des Concerts est effectué avec succès",
      concerts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'affichage des Concerts" });
  }
};
const updateConcert = async (req, res, next) => {
  try {
    const concertId = req.params.id;
    console.log("Request Body:", req.body);

    const concertMAJ = await Concert.findByIdAndUpdate(concertId, req.body, {
      new: true,
      runValidators: true,
    });
    if (req.file) {
      concertMAJ.affiche = req.file.filename;
    }
    //console.log("Updated Concert:", concertMAJ);
    await concertMAJ.save();
    if (!concertMAJ) {
      return res.status(404).json({ message: "Concert non trouvée" });
    }
    await concertMAJ.populate("saison");

    res.status(201).json({
      message: "La modification du Concert est effectuée avec succès",
      payload: concertMAJ,
    });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ message: "Erreur lors de la modification du Concert" });
  }
};

const deleteConcert = async (req, res, next) => {
  try {
    const concertId = req.params.id;
    const concert = await Concert.findByIdAndDelete(concertId);
    if (!concert) {
      return res.status(404).json({ message: "Concert non trouvée" });
    }
    const choristes = await User.find({ role: "choriste" });

    for (const choriste of choristes) {
      // Utiliser $pull pour retirer l'ID du concert de la liste Concerts
      await User.updateOne(
        { _id: choriste._id },
        { $pull: { Concerts: { Concert: concertId } } }
      );
    }
    res.status(200).json({
      message: "La suppression du Concert est effectuée avec succès",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du Concert" });
  }
};
const deleteAllConcerts = async (req, res, next) => {
  try {
    const result = await Concert.deleteMany();
    const choristes = await User.find({ role: "choriste" });

    for (const choriste of choristes) {
      await User.updateOne({ _id: choriste._id }, { $set: { Concerts: [] } });
    }
    res.status(200).json({
      message: `Suppression de ${result.deletedCount} concerts effectuée avec succès`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de tous les concerts" });
  }
};
const excelFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    const path = req.file.path;
    const programmeData = convertExcelToJson(path);

    let concert; // Déclarer la variable en dehors de la boucle

    for (const concertData of programmeData) {
      try {
        concert = new Concert({
          nom: concertData.nom,
          date: concertData.date,
          heure: concertData.heure,
          saison: concertData.saison,
          lieu: concertData.lieu,
          affiche: concertData.affiche,
          previsions: concertData.previsions,
          repetitions: concertData.repetitions,
          programme: concertData.programme.split(","),
        });
        const concerts = await Concert.find();

        let imageQr, codeQR;

        do {
          [imageQr, codeQR] = await genererQrCodeAleatoire();
        } while (!isQRCodeUnique(codeQR, concerts));

        concert.qrCode.code = codeQR;
        concert.qrCode.image = imageQr;
        /////////// add concert id dans liste choristes
        const choristes = await User.find({ role: "choriste" });

        for (const choriste of choristes) {
          choriste.Concerts.push({
            Concert: concert._id,
          });
          await choriste.save();
        }
        await concert.save();
      } catch (error) {
        console.error(error.message);
        res.status(404).json({ message: error.message });
        return;
      }
    }

    await concert.populate("saison");

    res.status(200).json({
      message: "Concerts added successfully from Excel file.",
      payload: concert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding concerts from Excel file." });
  }
};


const convertExcelToJson = (path) => {
  const work = xlsx.readFile(path);
  const sheetname = work.SheetNames[0];
  return xlsx.utils.sheet_to_json(work.Sheets[sheetname]);
};
const getOeuvreIdsByTitle = async (oeuvreTitres) => {
  console.log("oeuvreTitres:", oeuvreTitres);

  const oeuvreIds = [];
  for (const titre of oeuvreTitres) {
    const oeuvre = await Oeuvre.findOne({ titre: titre.trim() });
    if (oeuvre) {
      oeuvreIds.push(oeuvre._id);
    } else {
      throw new Error(`L'oeuvre avec le nom ${titre} n'a pas été trouvée.`);
    }
  }
  console.log("oeuvreIds:", oeuvreIds);
  return oeuvreIds;
};
const getSaisonIdByNom = async (saisonNom) => {
  console.log("saisonNom:", saisonNom);

  const saison = await Saison.findOne({ nom: saisonNom.trim() });
  if (saison) {
    console.log("saisonId:", saison._id);
    return saison._id;
  } else {
    throw new Error(`La saison avec le nom ${saisonNom} n'a pas été trouvée.`);
  }
};

const SaveSeuilconcert = async (req, res) => {
  try {
    const idConcert = req.params.id;

    const { seuil } = req.body;
    if (seuil < 0) return res.status(500).json({ msg: "invalid seuil" });

    const concert = await Concert.findOneAndUpdate(
      { _id: idConcert },
      { $set: { seuil: seuil } },
      { new: true }
    );

    if (!concert) return res.status(500).json({ msg: "concert non existante" });

    return res.status(200).json({ concert });
  } catch (error) {
    return res.status(500).json({ msg: error.response });
  }
};

const statistiqueParConcert = async (req, res) => {
  try {
    const concerts = await Concert.find();
    const users = await User.find();

    const statistiquesConcerts = [];

    for (const concert of concerts) {
      const repetitions = await Repetition.find({ concert: concert._id });
      const statistiqueConcert = {};
      const statistiquesRepetition = [];
      let presenceRepetitions = 0;
      let absenceRepetitions = 0;
      let presenceConcert = 0;
      let absenceConcert = 0;

      for (const user of users) {
        const usersConcert = user.Concerts.find(
          (c) => c.Concert.toString() == concert._id
        );
        if (usersConcert) {
          if (usersConcert.presence) {
            presenceConcert++;
          } else {
            absenceConcert++;
          }
        }
      }

      statistiqueConcert.concert = {
        _id: concert._id,
        nom: concert.nom,
        date: concert.date,
        heure: concert.heure,
        saison: concert.saison,
        lieu: concert.lieu,
        programme: [],
      };

      const programmePromises = concert.programme.map(async (oeuvreId) => {
        const oeuvre = await Oeuvre.findById(oeuvreId);
        statistiqueConcert.concert.programme.push({
          _id: oeuvre._id,
          nom: oeuvre.nom,
        });
      });

      await Promise.all(programmePromises);

      statistiqueConcert.absenceConcert = absenceConcert;
      statistiqueConcert.presenceConcert = presenceConcert;

      for (const repetition of repetitions) {
        const repetitionDetails = {
          date: repetition.date,
          lieu: repetition.lieu,
        };

        let presence = 0;
        let absence = 0;
        const statistiqueRepetition = {};

        for (const user of users) {
          const usersRepetition = user.Repetitions.find(
            (c) => c.repetition.toString() == repetition._id
          );
          if (usersRepetition) {
            if (usersRepetition.presence) {
              presence++;
              presenceRepetitions++;
            } else {
              absence++;
              absenceRepetitions++;
            }
          }
        }

        statistiqueRepetition.repetition = repetitionDetails;
        statistiqueRepetition.absence = absence;
        statistiqueRepetition.presence = presence;
        statistiquesRepetition.push(statistiqueRepetition);
      }

      statistiqueConcert.repetitions = statistiquesRepetition;
      statistiqueConcert.presenceRepetitions = presenceRepetitions;
      statistiqueConcert.absenceRepetitions = absenceRepetitions;
      statistiquesConcerts.push(statistiqueConcert);
    }

    res.status(200).json({ statistiquesConcerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur lors du calcul des statistiques d'absences pour les concerts",
    });
  }
};
const informerAbsence = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const { raisonAbsence } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found !" });
    }

    const concertUser = user.Concerts.find((c) => c.Concert.toString() == id);

    if (!concertUser) {
      return res.status(404).json({ message: "User has not this concert !" });
    }

    concertUser.presence = false;
    concertUser.raisonAbsence = raisonAbsence;

    await user.save();
    res.status(200).json({ message: "Absence confirmed !", payload: user });
  } catch (error) {
    res.status(500).json({ error: "Server error !" });
  }
};

const findActiveSeasonId = async () => {
  try {
    const season = await Saison.findOne({ archive: false });
    if (!season) {
      return res.status(404).json({ message: "Aucune saison active trouvée" });
    }
    return season._id;
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la recherche de la saison active");
  }
};
const getConcertsForActiveSeason = async (req, res, next) => {
  try {
    const activeSeasonId = await findActiveSeasonId();
    if (!activeSeasonId) {
      return res.status(404).json({ message: "Aucune saison active trouvée" });
    }
    const concerts = await Concert.find({ saison: activeSeasonId }).populate("saison");
    if (concerts.length === 0) {
    //   res.status(200).json({
    //   message: "Pas de concerts pour cette saison",
    //   concerts,
    // });
      //console.log("Pas de concerts dans cette saison");
    }
    res.status(200).json({
      message: "L'affichage des Concerts de la saison active est effectué avec succès",
      concerts,
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des Concerts de la saison active:", error);
    res.status(500).json({ message: "Erreur lors de l'affichage des Concerts de la saison active" });
  }
};



module.exports = {
  SaveSeuilconcert,
  addConcert,
  getConcert,
  updateConcert,
  deleteConcert,
  deleteAllConcerts,
  excelFile,
  getOeuvreIdsByTitle,
  getSaisonIdByNom,
  statistiqueParConcert,
  informerAbsence,
  getConcerts,
  getConcertsForActiveSeason,
  findActiveSeasonId
};
