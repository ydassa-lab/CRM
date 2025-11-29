const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  telephone: { type: String, required: true },
  adresse: { type: String },
  ville: { type: String },
  pays: { type: String },
  typeClient: { type: String, enum: ["particulier", "entreprise"], default: "particulier" },
  entreprise: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "commercial", "marketing", "support", "manager", "client"],
    default: "client"
  },
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);