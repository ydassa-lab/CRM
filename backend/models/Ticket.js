// crm-backend/models/Ticket.js
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },

  // Qui a créé le ticket
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Assigné à quel agent/support ?
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  status: { 
    type: String, 
    enum: ["Ouvert", "En cours", "Résolu", "Fermé"], 
    default: "Ouvert" 
  },

  responses: [
    {
      message: String,
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now }
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
