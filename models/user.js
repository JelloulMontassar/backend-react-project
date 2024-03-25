const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["inactif", "actif"],
      default: "actif",
    },
    niveauExperience: {
      type: String,
      enum: ["junior", "senior", "veteran"],
      default: function () {
        if (this.role != "manager" && this.role != "admin") {
          return "junior";
        }
      },
    },
    id_national: { type: String, required: true },
    nationalite: { type: String, required: true },
    date_de_naissance: { type: Date, required: true },
    situation_professionnelle: { type: String, required: true },
    taille: { type: Number, required: true },
    sexe: { type: String, enum: ["femme", "homme"], required: true },
    role: {
      type: String,
      enum: [
        "choriste",
        "chef de pupitre",
        "chef de choeur",
        "manager",
        "admin",
      ],
      required: true,
    },
    Concerts: [
      {
        Concert: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Concert",
          required: true,
        },
        raison: { type: String },
        raisonAbsence: { type: String },
        presence: { type: Boolean, required: true, default: false },
        placement: { type: String },
        disponibilite: { type: Boolean },
      },
    ],
    Repetitions: [
      {
        repetition: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Repetition",
          required: true,
        },
        raison: { type: String },
        presence: { type: Boolean, required: true, default: false },
        raisonAbsence: { type: String },
      },
    ],
    conges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conge",
        required: true,
      },
    ],

    nb_absence_total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
