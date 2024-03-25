const mongoose = require("mongoose");

const saisonSchema = new mongoose.Schema({
  nom: {
    type: String,
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
  seuil_absence: {
    type: String,
    required: true,
  },
  
  archive: {
    type: Boolean,
    default: false,
    required: true,
  },
  seuilNomination: {
    type: Number,
    default: 5, 
  },
  seuilElimination: {
    type: Number,
    default: 10, 
  },
  ListeDesNomines: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ],
  ListeDesElimines: [
    {
      choriste: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      raison: String,
      dateElimination: {
        type: Date,
      },
      dateFinElimination: Date, 
      dureeElimination: {type: Number, default: 365}
    },
    
  ],
  dureeElimination: {
    type: Number,  
    default: 365,  
  },
});

const Saison = mongoose.model("Saison", saisonSchema);

module.exports = Saison;
