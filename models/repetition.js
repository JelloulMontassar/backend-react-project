const mongoose = require("mongoose");

const repetitionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    lieu: { type: String, required: true },
    heure_deb: { type: Date, required: true },
    heure_fin: { type: Date, required: true },
    pupitres: [
      {
        pupitre: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pupitre",
          required: true,
        },
        pourcentage: { type: Number, required: true },
      },
    ],
    concert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concert",
      required: true,
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    qrCode: { code:{type: String, required: true},image:{type: String, required: true} },

  },
  { timestamps: true }
);

const Repitition = mongoose.model("Repitition", repetitionSchema);

module.exports = Repitition;
