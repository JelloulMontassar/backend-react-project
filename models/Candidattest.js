const mongoose = require("mongoose");

const candidatSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const Candidattest = mongoose.model("Candidattest", candidatSchema);

module.exports = Candidattest;
