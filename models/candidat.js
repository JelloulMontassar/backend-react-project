const mongoose = require("mongoose");

const candidatSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    id_national: { type: String, required: true, unique: true },
    nationalite: { type: String, required: true },
    date_de_naissance: { type: Date, required: true },
    situation_professionnelle: { type: String, required: true },
    taille: { type: Number, required: true },
    sexe: { type: String, enum: ["femme", "homme"], required: true },
    heure_debut_audition: { type: Date },
    heure_fin_audition: { type: Date},
    date_audition: { type: Date},
    decision: {
      type: String,
      required: true,
      enum: ["retenu", "rejete", "pas encore"],
      default: "pas encore",
    },
    confirmation: {
      type: Boolean,
    },
    note: {
      type: Number,
      min: 1,
      max: 3,
    },
    extrait_chante: { type: String },
    tessiture: { type: String },
    audition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audition",
      //required: true,
    },
  },
  { timestamps: true }
);

candidatSchema.virtual("evaluation").get(function () {
  const numericValue = this.note;

  const gradeLetters = {   
    3: "A",
    2: "B",
    1: "C",
  };

  return gradeLetters[numericValue] || "N/A";
});

candidatSchema.set("toJSON", { virtuals: true });
candidatSchema.set("toObject", { virtuals: true });

const Candidat = mongoose.model("Candidat", candidatSchema);

module.exports = Candidat;
