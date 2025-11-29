const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    email: { type: String },
    telephone: { type: String },
    source: { type: String, default: "prospect" },
    notes: { type: String },

    // Prospect d'origine (si converti)
    prospectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prospect",
      default: null
    },

    // Opportunités liées
    opportunities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity"
    }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
