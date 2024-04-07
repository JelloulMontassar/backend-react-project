const Oeuvre = require("../models/oueuvre");
const User = require("../models/user");
const Repetition = require("../models/repetition");
const Concert = require("../models/concert");

const ajout = async (req, res) => {
  try {
    const oeuvre = new Oeuvre(req.body);
    await oeuvre.save();
    await oeuvre.populate("pupitre");
    res.status(201).send(oeuvre);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getoeuvre = async (req, res) => {
  try {
    const oeuvres = await Oeuvre.find({}).populate("pupitre");
    res.send(oeuvres);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getoeuvrebyId = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findById(req.params.id);
    if (!oeuvre) {
      return res.status(404).send();
    }
    res.send(oeuvre);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateoeuvre = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!oeuvre) {
      return res.status(404).send();
    }
    await oeuvre.populate("pupitre");
    res.send(oeuvre);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteoeuvre = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findByIdAndDelete(req.params.id);
    if (!oeuvre) {
      return res.status(404).send();
    }
    res.send(oeuvre);
  } catch (error) {
    res.status(500).send(error);
  }
};
const statistiqueParOeuvre = async (req, res) => {
  try {
    const oeuvres = await Oeuvre.find();
    const concerts = await Concert.find();

    const statistiquesOeuvres = [];

    for (const oeuvre of oeuvres) {
      const statistiqueOeuvre = {
        idOeuvre: oeuvre._id,
        titre: oeuvre.titre,
        compositeur: oeuvre.compositeur,

        totalConcerts: 0,
      };

      for (const concert of concerts) {
        const repetitions = await Repetition.find({
          concert: concert._id,
          "presence.oeuvreId": oeuvre._id,
        });

        const nombreTotalRepetitions = repetitions.length;
        const nombrePresent = repetitions.reduce((total, rep) => {
          const presence = rep.presence.find(
            (p) => p.oeuvreId.toString() === oeuvre._id.toString() && p.present
          );
          return total + (presence ? 1 : 0);
        }, 0);

        const concertsAvecOeuvre = concerts.filter((c) =>
          c.programme.includes(oeuvre._id.toString())
        );

        statistiqueOeuvre.totalConcerts += concertsAvecOeuvre.length;
      }

      statistiquesOeuvres.push(statistiqueOeuvre);
    }

    res.status(200).json({ statistiquesOeuvres });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur lors du calcul des statistiques par œuvre pour les concerts",
    });
  }
};

module.exports = {
  ajout,
  getoeuvre,
  getoeuvrebyId,
  deleteoeuvre,
  updateoeuvre,
  statistiqueParOeuvre,
};
