const mongoose = require("mongoose");

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  prospect: { type: mongoose.Schema.Types.ObjectId, ref: "Prospect", required: false }, // optional link
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  probability: { type: Number, min: 0, max: 100, default: 0 },
  stage: { 
    type: String, 
    enum: ["Découverte","Proposition","Négociation","Gagné","Perdu"], 
    default: "Découverte" 
  },
  expectedCloseDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Opportunity", OpportunitySchema);
