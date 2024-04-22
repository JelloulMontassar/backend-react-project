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
        const pupitre = await Pupitre.findById(element.pupitre);
        if (pupitre) {
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
        select: "nom prenom"
      });
    res.status(200).json({ payload: repetitions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const repetition = await Repetition.findById(req.params.id);
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

    const repetitionUser = user.Repetitions.find(
      (c) => c.repetition.toString() == id
    );

    if (!repetitionUser) {
      return res
        .status(404)
        .json({ message: "User has not this repetition !" });
    }

    repetitionUser.presence = false;
    repetitionUser.raisonAbsence = raisonAbsence;

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
