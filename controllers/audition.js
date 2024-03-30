const Audition = require("../models/audition");
const Candidat = require("../models/candidat");
const { envoyerEmail, envoyerEmail2 } = require("../utils/AuditionTimeMail");
const moment = require("moment");

const getAudition = async (req, res) => {
  try {
    const auditions = await Audition.find({});
    res.status(200).json({ message: "Success", payload: auditions });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de récupération de l'audition" });
  }
};
const updateAudition = async (req, res) => {
  try {
    const auditionId = req.params.id;
    const updatedAudition = await Audition.findByIdAndUpdate(
      auditionId,
      req.body,
      { new: true }
    );
    if (!updatedAudition) {
      return res.status(404).json({ message: "Audition non trouvée" });
    }
    res.status(200).json({
      message: "Audition mise à jour avec succès",
      payload: updatedAudition,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour l'audition" });
  }
};
const deleteAudition = async (req, res) => {
  try {
    const auditionId = req.params.id;

    const audition = await Audition.findByIdAndDelete(auditionId);
    if (!audition) {
      return res.status(404).json({ message: "Audition non trouvée" });
    }
    // await Candidat.updateMany(
    //   { audition: auditionId },
    //   { $unset: { audition: 1 } }
    // );

    res.status(201).json({
      message: "Suppression de l'audition est effectuée avec succès",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression l'audition" });
  }
};

async function genererPlanification(req, res) {
  try {
    const auditionId = req.body.auditionId;
    const auditionSaison = await Audition.findOne({ _id: auditionId });

    if (!auditionSaison) {
      throw new Error("Audition non trouvée");
    }

    const candidats = await Candidat.find({
      decision: "pas encore",
      date_audition: { $exists: false },
    });
    const nombreSeancesParJour = auditionSaison.nombreSeancesParJour;
    const dureeAuditionMinutes = auditionSaison.dureeAudition;
    const nombreTotalSeances = Math.ceil(
      candidats.length / nombreSeancesParJour
    );

    const planning = [];

    let dateDebutAudition = moment(auditionSaison.dateDebut)
      .hours(auditionSaison.heureDebutAudition)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);

    for (let seance = 0; seance < nombreTotalSeances; seance++) {
      for (
        let seanceJour = 0;
        seanceJour < nombreSeancesParJour;
        seanceJour++
      ) {
        const candidatIndex = seance * nombreSeancesParJour + seanceJour;

        if (candidatIndex < candidats.length) {
          const candidat = candidats[candidatIndex];

          if (candidat.date_audition) {
            continue;
          }

          const dateFinAudition = dateDebutAudition
            .clone()
            .add(dureeAuditionMinutes, "minutes");

          if (dateFinAudition.isAfter(auditionSaison.dateFin)) {
            console.warn(
              "La date de fin de l'audition dépasse la date spécifiée."
            );
            res.status(400).json({
              success: false,
              error: "La date de fin de l'audition dépasse la date spécifiée.",
            });
            return;
          }

          candidat.heure_debut_audition = dateDebutAudition.toDate();
          candidat.heure_fin_audition = dateFinAudition.toDate();
          candidat.date_audition = dateDebutAudition.toDate();
          candidat.audition = auditionSaison._id;

          await candidat.save();
          await envoyerEmail(
            candidat,
            moment(dateDebutAudition),
            moment(dateFinAudition)
          );

          planning.push({
            nom: candidat.nom,
            prenom: candidat.prenom,
            date_audition: dateDebutAudition.format("DD/MM/YYYY"),
            heure_debut_audition: dateDebutAudition.format("HH:mm"),
            heure_fin_audition: dateFinAudition.format("HH:mm"),
          });

          dateDebutAudition.add(dureeAuditionMinutes, "minutes");
        }
      }

      dateDebutAudition = moment(auditionSaison.dateDebut)
        .add(seance + 1, "days")
        .hours(auditionSaison.heureDebutAudition)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);
    }

    console.log("Planification des auditions générée avec succès");
    res.status(200).json({ success: true, data: planning });
  } catch (error) {
    console.error(
      "Erreur lors de la génération de la planification des auditions:",
      error.message
    );
    res.status(500).json({ success: false, error: error.message });
  }
}

async function genererPlanification2(req, res) {
  try {
    const auditionId = req.body.auditionId;
    const auditionSaison = await Audition.findOne({ _id: auditionId });
    const listeCandidat = req.body.listeCandidat;
    if (!auditionSaison) {
      throw new Error("Audition non trouvée");
    }

    const { dateDebut, dateFin } = req.body;

    const momentDateDebut = moment(dateDebut, "DD/MM/YYYY", true);
    const momentDateFin = moment(dateFin, "DD/MM/YYYY", true);

    if (!momentDateDebut.isValid() || !momentDateFin.isValid()) {
      throw new Error(
        "Format de date invalide. Utilisez le format DD/MM/YYYY."
      );
    }
    let candidats = [];
    if (listeCandidat.length == 0) {
      candidats = await Candidat.find({
        decision: "pas encore",
      });
    } else {
      candidats = await Candidat.find({ _id: { $in: listeCandidat } });
    }
    const nombreSeancesParJour = auditionSaison.nombreSeancesParJour;
    const dureeAuditionMinutes = auditionSaison.dureeAudition;
    const nombreTotalSeances = Math.ceil(
      candidats.length / nombreSeancesParJour
    );

    const planning = [];

    let dateDebutAudition = momentDateDebut
      .hours(auditionSaison.heureDebutAudition)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);

    for (let seance = 0; seance < nombreTotalSeances; seance++) {
      for (
        let seanceJour = 0;
        seanceJour < nombreSeancesParJour;
        seanceJour++
      ) {
        const candidatIndex = seance * nombreSeancesParJour + seanceJour;

        if (candidatIndex < candidats.length) {
          const candidat = candidats[candidatIndex];

          const dateFinAudition = dateDebutAudition
            .clone()
            .add(dureeAuditionMinutes, "minutes");

          if (dateFinAudition.isAfter(momentDateFin)) {
            console.warn(
              "La date de fin de l'audition dépasse la date spécifiée."
            );
            res.status(400).json({
              success: false,
              error: "La date de fin de l'audition dépasse la date spécifiée.",
            });
            return;
          }

          candidat.heure_debut_audition = dateDebutAudition.toDate();
          candidat.heure_fin_audition = dateFinAudition.toDate();
          candidat.date_audition = dateDebutAudition.toDate();
          candidat.audition = auditionSaison._id;

          await candidat.save();
          await envoyerEmail2(
            candidat,
            moment(dateDebutAudition),
            moment(dateFinAudition)
          );

          planning.push({
            nom: candidat.nom,
            prenom: candidat.prenom,
            date_audition: dateDebutAudition.format("DD/MM/YYYY"),
            heure_debut_audition: dateDebutAudition.format("HH:mm"),
            heure_fin_audition: dateFinAudition.format("HH:mm"),
          });

          dateDebutAudition.add(dureeAuditionMinutes, "minutes");
        }
      }

      dateDebutAudition = momentDateDebut
        .add(seance + 1, "days")
        .hours(auditionSaison.heureDebutAudition)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);
    }

    console.log("Planification des auditions générée avec succès");
    res.status(200).json({ success: true, data: planning });
  } catch (error) {
    console.error(
      "Erreur lors de la génération de la planification des auditions:",
      error.message
    );
    res.status(500).json({ success: false, error: error.message });
  }
}

const createAudition = async (req, res) => {
  try {
    const {
      saison,
      dateDebut,
      dateFin,
      dureeAudition,
      heureDebutAudition,
      heureFinAudition,
      joursAudition,
      nombreSeancesParJour,
    } = req.body;

    const dateDebutObj = moment(dateDebut, "DD/MM/YYYY").toDate();
    const dateFinObj = moment(dateFin, "DD/MM/YYYY").toDate();

    const nouvelleAudition = new Audition({
      saison,
      dateDebut: dateDebutObj,
      dateFin: dateFinObj,
      dureeAudition,
      heureDebutAudition,
      heureFinAudition,
      nombreSeancesParJour,
    });

    const auditionEnregistree = await nouvelleAudition.save();

    res.status(201).json({ success: true, data: auditionEnregistree });
  } catch (error) {
    console.error("Erreur lors de la création de l'audition :", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

async function getPlanning(req, res) {
  try {
    const auditionId = String(req.params.id);

    const auditionSaison = await Audition.findOne({ _id: auditionId }).populate(
      "saison"
    );

    if (!auditionSaison) {
      throw new Error("Audition non trouvée");
    }

    const candidats = await Candidat.find({ audition: auditionSaison._id });

    const planning = candidats.map((candidat) => ({
      nom: candidat.nom,
      prenom: candidat.prenom,
      date_audition: moment(candidat.date_audition).format("DD/MM/YYYY"),
      heure_debut_audition: moment(candidat.heure_debut_audition).format(
        "HH:mm"
      ),
      heure_fin_audition: moment(candidat.heure_fin_audition).format("HH:mm"),
    }));

    res.status(200).json({ success: true, data: planning });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du planning des auditions :",
      error.message
    );
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = {
  updateAudition,
  getAudition,
  deleteAudition,
  genererPlanification,
  createAudition,
  getPlanning,
  genererPlanification2,
};
