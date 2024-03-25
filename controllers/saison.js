const Saison = require("../models/saison");
const User= require("../models/user")
const { sendNominatedEmails } = require("../utils/NominationEmail");
const { sendEliminatedEmails } = require("../utils/EliminationEmail");


const userController = require("./user")

const createSaison = async (req, res) => {
  try {
    const { nom, dateDebut, dateFin, seuil_absence, archive } = req.body;
    const dateActuelle = new Date();

    await Saison.updateOne(
      { dateFin: { $lte: dateActuelle } },
      { $set: { archive: true } }
    );

    const nouvelleSaison = new Saison({
      nom,
      dateDebut,
      dateFin,
      seuil_absence,
      archive,
    });

    const saisonEnregistree = await nouvelleSaison.save();

    res.status(201).json({ success: true, data: saisonEnregistree });
  } catch (error) {
    console.error("Erreur lors de la création de la saison :", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const getSaison = async (req, res) => {
  try {
    const saisons = await Saison.find();
    res.status(201).json({ success: true, data: saisons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

const getSaisonbyId = async (req, res) => {
  try {
    const saison = await Saison.findById({ _id: req.params.id });
    if (!saison) {
      return res.status(404).json({ msg: "saison non existante" });
    }
    res.status(200).json({ success: true, msg: saison });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateSaison = async (req, res) => {
  try {
    const saison = await Saison.findByIdAndUpdate(
      { _id: req.params.id },
      req.body
    );
    if (!saison) {
      return res.status(404).json({ msg: "saison non existante" });
    }
    res.status(200).json({ success: true, msg: "saison modifiée" });
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteSaison = async (req, res) => {
  try {
    const saison = await Saison.findByIdAndDelete(req.params.id);
    if (!saison) {
      return res.status(404).json({ msg: "saison non existante" });
    }
    res.status(200).json({ success: true, msg: "saison deleted" });
  } catch (error) {
    res.status(400).json(error);
  }
};
/////
const updateSeuils = async (req, res) => {
  const { saisonId } = req.params;
  const { seuilNomination, seuilElimination } = req.body;

  try {
    const saison = await Saison.findById(saisonId);

    if (!saison) {
      return res.status(404).json({ message: 'Saison not found' });
    }

    // update que fields dans request body
    if (seuilNomination !== undefined) {
      saison.seuilNomination = seuilNomination;
    }

    if (seuilElimination !== undefined) {
      saison.seuilElimination = seuilElimination;
    }

    await saison.save();
    let updatedFields = [];
    if (seuilNomination !== undefined) {
      updatedFields.push('seuilNomination');
    }
    if (seuilElimination !== undefined) {
      updatedFields.push('seuilElimination');
    }
    res.status(200).json({ message: `Seuils (${updatedFields.join(', ')}) updated successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating seuils' });
  }
};
const getListeNominations = async (req, res) => {
  try {
    const { saisonId } = req.params;
    const saison = await Saison.findById(saisonId);
    console.log(saison);
    if (!saison) {
      return res.status(404).json({ message: 'Saison not found' });
    }

    const seuilNomination = saison.seuilNomination;

    const nominatedChoristes = await User.find({
      role: 'choriste',
      nb_absence_total: { $eq: seuilNomination }
    });

    await Saison.updateOne(
      { _id: saison._id },
      { $set: { ListeDesNomines: nominatedChoristes.map(choriste => choriste._id) } }
    );
    //envoyer emails
    await sendNominatedEmails(nominatedChoristes);
    res.status(200).json({
      seuilNomination: seuilNomination,
      nominatedChoristes: nominatedChoristes
      /*nominatedChoristes: nominatedChoristes.map(choriste => ({
        _id: choriste._id,
        nom: choriste.nom,
        prenom: choriste.prenom,
        email: choriste.email,
        numero_téléphone: choriste.telephone
      })), */
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching nominated choristers" });
  }
};
const getListeEliminations = async (req, res) => {
  try {
    const { saisonId } = req.params;
    const saison = await Saison.findById(saisonId);
    console.log(saison);
    if (!saison) {
      return res.status(404).json({ message: 'Saison not found' });
    }
    const seuilElimination= saison.seuilElimination;
    const eliminatedChoristes = await User.find({
      role: 'choriste',
      nb_absence_total: { $gte: seuilElimination }
    });
    await Saison.updateOne(
      { _id: saison._id },
      { $set: { ListeDesElimines: eliminatedChoristes.map((choriste) => ({
        choriste: choriste._id, raison:"Dépassement seuil d'élimination",dateElimination: Date.now(),dateFinElimination: new Date(
          Date.now() + saison.dureeElimination * 24 * 60 * 60 * 1000
        ),
      })),} }
    );
    await sendEliminatedEmails(eliminatedChoristes)
    res.status(200).json({
      seuilElimination: seuilElimination,
      nombre_choristes_elimines: eliminatedChoristes.length,
      nominatedChoristes: eliminatedChoristes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching eliminated choristers" });
  }
}
const updateDureeElimination = async (req, res) => {
  try {
    const { dureeElimination } = req.body;
    const { saisonId } = req.params;
    
    const saison = await Saison.findByIdAndUpdate(
      saisonId,
      { $set: { dureeElimination: dureeElimination } },
      { new: true }
    );

    if (!saison) {
      return res.status(404).json({ message: 'Saison not found' });
    }

    return res.status(200).json({ success: true, data: saison, message: "Duree elimination updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSaison,
  deleteSaison,
  updateSaison,
  getSaison,
  getSaisonbyId,
  updateSeuils,
  getListeNominations,
  getListeEliminations,
  updateDureeElimination
};
