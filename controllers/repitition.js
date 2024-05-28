const Repetition = require("../models/repetition");
const Concert = require("../models/concert");
const Pupitre = require("../models/pupitre");
const {
  genererQrCodeAleatoire,
  isQRCodeUnique,
} = require("../utils/genererQrCode");
const User = require("../models/user");
async function create(req, res) {
  try {
    const concert = await Concert.findById(req.body.concert);

    if (concert) {
      const participants = [];
      for (let j = 0; j < req.body.pupitres.length; j++) {
        const element = req.body.pupitres[j];
        const pupitre = await Pupitre.findOne({ type_voix: element.pupitre });
        if (pupitre) {
          req.body.pupitres[j].pupitre = pupitre._id; // Utiliser l'ObjectId du pupitre
          const len = (element.pourcentage / 100) * pupitre.membres.length;
          for (let i = 0; i < len; i++) {
            participants.push(pupitre.membres[i]);
          }
        } else {
          return res.status(404).json({ error: "pupitre not found" });
        }
      }
      const repetition = new Repetition({
        ...req.body,
        participants: participants,
      });
      const repetitions = await Repetition.find();
      let imageQr, codeQR;

      do {
        [imageQr, codeQR] = await genererQrCodeAleatoire();
      } while (!isQRCodeUnique(codeQR, repetitions));

      repetition.qrCode.code = codeQR;
      repetition.qrCode.image = imageQr;

      const savedrepetition = await repetition.save();
      await savedrepetition.populate([
        { path: "concert" },
        {
          path: "pupitres",
          populate: {
            path: "pupitre",
            model: "Pupitre",
            select: "type_voix",
          },
        },
        {
          path: "participants",
          model: "User",
          select: "nom prenom",
        },
      ]);
      for (let i = 0; i < participants.length; i++) {
        const user = await User.findById(participants[i]);
        if (user) {
          user.Repetitions.push({ repetition: savedrepetition._id });
          await user.save();
        }
      }
      res.status(201).json({ payload: savedrepetition });
    } else {
      return res.status(404).json({ error: "concert not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAll(req, res) {
  try {
    const repetitions = await Repetition.find()
      .populate("concert", "nom")
      .populate({
        path: "pupitres.pupitre",
        model: "Pupitre",
        select: "type_voix",
      })
      .populate({
        path: "participants",
        model: "User",
        select: "nom prenom",
      });
    res.status(200).json({ payload: repetitions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const repetition = await Repetition.findById(req.params.id)
      .populate("concert", "nom")
      .populate({
        path: "pupitres.pupitre",
        model: "Pupitre",
        select: "type_voix",
      })
      .populate({
        path: "participants",
        model: "User",
        select: "nom prenom",
      });
    if (!repetition) {
      return res.status(404).json({ error: "repetition not found" });
    }
    res.status(200).json({ payload: repetition });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const repetition = await Repetition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!repetition) {
      return res.status(404).json({ error: "repetition not found" });
    }
    await repetition.populate([
      { path: "concert" },
      {
        path: "pupitres",
        populate: {
          path: "pupitre",
          model: "Pupitre",
          select: "type_voix",
        },
      },
      {
        path: "participants",
        model: "User",
        select: "nom prenom",
      },
    ]);
    res.status(200).json({ payload: repetition });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const repetition = await Repetition.findByIdAndDelete(req.params.id);
    if (!repetition) {
      return res.status(404).json({ error: "repetition not found" });
    }

    // Supprimer la répétition de chaque utilisateur
    const users = await User.find({ "Repetitions.repetition": req.params.id });
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      user.Repetitions = user.Repetitions.filter(
        (rep) => rep.repetition.toString() !== req.params.id
      );
      await user.save();
    }

    res.status(201).json({ message: "repetition deleted !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const informerAbsence = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const { raisonAbsence } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found !" });
    }
    console.log(user);
    const repitionUser = user.Repetitions.find(
      (c) => c.repetition.toString() == id
    );
    console.log(repitionUser);
    if (!repitionUser) {
      return res.status(404).json({ message: "User has not this repition !" });
    }
    repitionUser.disponibilite = false;
    repitionUser.raisonAbsence = raisonAbsence;

    await user.save();
    res.status(200).json({ message: "Absence confirmed !", payload: user });
  } catch (error) {
    res.status(500).json({ error: "Server error !" });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  informerAbsence,
};
