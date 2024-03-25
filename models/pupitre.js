const mongoose = require("mongoose");

const pupitreSchema = new mongoose.Schema(
  {
    type_voix: {
      type: String,
      required: true,
      enum: ["basse", "ténor", "alto", "soprano"],
      unique: true,
    },
    besoin: { type: Number, required: true },
    chef_pupitre: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    membres: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
  },
  { timestamps: true }
);

const Pupitre = mongoose.model("Pupitre", pupitreSchema);

module.exports = Pupitre;
