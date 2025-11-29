// crm-backend/models/Prospect.js
const mongoose = require("mongoose");

const ProspectSchema = new mongoose.Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  email: { type: String, required: false, lowercase: true },
  telephone: { type: String, required: false },
  source: { type: String, default: "inconnu" }, // facebook, google, referral...
  statut: { type: String, enum: ["Nouveau","Contacté","Relance","Converti"], default: "Nouveau" },
  notes: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // commercial assigné
  convertedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Prospect", ProspectSchema);
