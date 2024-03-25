const mongoose = require("mongoose");

const historiqueStatutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    yearsAndStatus: [
      {
        _id: false,
        dateDebut_année_de_la_saison: Number,
        niveauExperience: {
          type: String,
          enum: ["Choriste", "Choriste Junior", "Senior", "Vétéran"],
          default: "Choriste Junior",
        },
      },
    ],
  },
  { timestamps: true }
);

const HistoriqueStatut = mongoose.model(
  "HistoriqueStatut",
  historiqueStatutSchema
);

module.exports = HistoriqueStatut;
