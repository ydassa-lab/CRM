const mongoose = require("mongoose");   // ← IMPORT MANQUANT (la cause de ton erreur)

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  status: { 
    type: String, 
    enum: ["Ouvert", "En cours", "Résolu", "Fermé"], 
    default: "Ouvert" 
  },

  priority: {
    type: String,
    enum: ["Faible", "Normal", "Urgent"],
    default: "Normal"
  },

  attachment: {
    type: String,
    default: null
  },

  responses: [
    {
      message: String,
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      attachment: String
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
