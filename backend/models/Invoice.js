const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",     // ✔ le client est un User
      required: true,
    },

    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      default: null,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",     // ✔ l’utilisateur qui crée la facture
      required: true,
    },

    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number },
      },
    ],

    totalAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },

    paymentHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String,
      },
    ],
  },
  { timestamps: true }
);

// Calcul automatique
invoiceSchema.pre("save", function () {
  this.items = this.items.map((item) => ({
    ...item,
    total: item.quantity * item.price,
  }));

  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
});

module.exports = mongoose.model("Invoice", invoiceSchema);
