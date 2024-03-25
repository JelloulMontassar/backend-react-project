const mongoose = require("mongoose");
const moment = require("moment");
const concertSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return moment(value, "YYYY-MM-DD", true).isValid();
        },
        message: (props) =>
          `${props.value} n'est pas un format de date valide. Utilisez YYYY-MM-DD.`,
      },
    },
    heure: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return moment(value, "HH:mm", true).isValid();
        },
        message: (props) =>
          `${props.value} n'est pas un format d'heure valide. Utilisez HH:mm.`,
      },
    },
    saison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saison",
      //required: true,
    },

    lieu: { type: String, required: true },
    affiche: {
      type: String,
    },
    previsions: { type: String },
    repetitions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repetition" }],
    programme: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Oeuvre", required: true },
    ],
    qrCode: {
      code: {
        type: String,
        //, required: true
      },
      image: {
        type: String,
        //required: true
      },
    },
    seuil: { type: Number },
  },
  { timestamps: true }
);

const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;
