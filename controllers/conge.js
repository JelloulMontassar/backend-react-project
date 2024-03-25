const Conge = require("../models/conge");
const User = require("../models/user");
const Pupitre = require("../models/pupitre");
const { io } = require("../socket");

exports.create = async (req, res) => {
  try {
    const { userId } = req.auth;
    const conge = new Conge({ ...req.body, createdBy: userId });
    const savedConge = await conge.save();
    const user = await User.findById(userId);
    console.log(user.conges);
    user.conges = [...user.conges, savedConge._id];
    user.save();
    const admin = await User.findOne({role:"admin"})
    io.emit(`notif-${admin._id.toString()}`, {
      message: `Le choriste ${user.nom} ${user.prenom} a demandé un congé.`,
    });
    res.status(201).json({
      message: "Conge added succesfully !",
      payload: savedConge,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating congé" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const conges = await Conge.find();
    res.json({ payload: conges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving congés" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const conge = await Conge.findById(id);
    if (!conge) {
      res.status(404).json({ message: "Congé not found" });
    } else {
      res.json({ payload: conge });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving congé" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const conge = await Conge.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!conge) {
      res.status(404).json({ message: "Congé not found" });
    } else {
      res.json({ payload: conge });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating congé" });
  }
};

exports.delete = async (req, res) => {
  try {
    const conge = await Conge.findByIdAndDelete(req.params.id);
    if (!conge) {
      res.status(404).json({ message: "Congé not found" });
    } else {
      res.json({ message: "Congé deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting congé" });
  }
};
exports.validerConge = async (req, res) => {
  try {
    const congeId = req.params.id;
    const conge = await Conge.findByIdAndUpdate(
      congeId,
      { valide: true },
      { new: true }
    );

    if (!conge) {
      return res.status(404).json({ message: "Congé non trouvé" });
    }

    const dateDebutConge = conge.dateDebut;
    const dateFinConge = conge.dateFin;
    const dateActuelle = new Date();

    if (dateActuelle >= dateDebutConge) {
      // Maj attribut statutConge du user
      const userId = conge.createdBy;
      await User.findByIdAndUpdate(userId, { status: "inactif" });
    }

    const userId = conge.createdBy;
    const pupitre = await Pupitre.findOne({ membres: userId });
    const PupitreChef = await User.findOne({ _id: pupitre.chef_pupitre[0] });
    const choriste = await User.findOne({ _id: userId });

    io.emit(`notif-${PupitreChef._id.toString()}`, {
      message: `Le choriste ${choriste.nom} ${choriste.prenom} valide un congé du ${dateDebutConge.toLocaleDateString()} au ${dateFinConge.toLocaleDateString()}.`,
    });

    io.emit(`notif-${userId.toString()}`, {
      message: `Vous etes en congé du ${dateDebutConge.toLocaleDateString()} au ${dateFinConge.toLocaleDateString()}.`,
    });

    res.status(201).json({
      message: "Congé validé avec succès",
      conge,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la validation du congé" });
  }
};
