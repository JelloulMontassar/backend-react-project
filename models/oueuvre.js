const mongoose = require("mongoose");

const oeuvreSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    titre: { type: String, required: true },
    compositeur: { type: String, required: true },
    arrangeur: { type: String, required: true },
    anne: { type: Date, required: true },
    genre: { type: String, required: true },
    parole: { type: String, required: true },
    partition: { type: String, required: true },
    avecChoeur: { type: Boolean, default: false },
    pupitre: { type: mongoose.Schema.Types.ObjectId, ref: "Pupitre" },
  },
  { timestamps: true }
);

const Oeuvre = mongoose.model("Oeuvre", oeuvreSchema);

module.exports = Oeuvre;
