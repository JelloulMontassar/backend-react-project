const mongoose = require("mongoose");

const auditionSchema = new mongoose.Schema(
  {
    saison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saison",
      required: true,
    },

    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      required: true,
    },
    dureeAudition: {
      type: Number,
      required: true,
    },
    heureDebutAudition: {
      type: Number,
      required: true,
    },
    heureFinAudition: {
      type: Number,
      required: true,
    },
    nombreSeancesParJour: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Audition = mongoose.model("Audition", auditionSchema);

module.exports = Audition;
