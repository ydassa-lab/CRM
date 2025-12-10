const mongoose = require("mongoose");

const notifSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String }, // ex: /client/tickets/123
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notifSchema);
