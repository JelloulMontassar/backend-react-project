const mongoose = require("mongoose");

const congeSchema = new mongoose.Schema({
  dateDebut: {
    type: Date,
    required: true,
  },
  dateFin: {
    type: Date,
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  valide:  {
    type: Boolean,
    default: false,
  },
});

const Conge = mongoose.model("Conge", congeSchema);

module.exports = Conge;
