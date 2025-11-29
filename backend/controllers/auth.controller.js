const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

// Signup: ANYONE can create any role. Clients => isActive=false, others => isActive=true
exports.signup = async (req, res, next) => {
  try {
    const {
      prenom, nom, email, telephone,
      adresse, ville, pays, typeClient, entreprise,
      password, role
    } = req.body;

    // Required fields
    if (!prenom || !nom || !email || !telephone || !password || !role) {
      return res.status(400).json({ message: "Champs obligatoires manquants : prenom, nom, email, telephone, password, role" });
    }

    // Validate role
    const validRoles = ["admin", "commercial", "marketing", "support", "manager", "client"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    // Client entreprise requires entreprise name
    if (role === "client" && typeClient === "entreprise" && (!entreprise || entreprise.trim() === "")) {
      return res.status(400).json({ message: "Nom de l'entreprise requis pour le type 'entreprise'." });
    }

    // Check duplicate email
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email déjà utilisé." });

    const isActive = role === "client" ? false : true;

    const user = await User.create({
      prenom, nom, email, telephone, adresse, ville, pays,
      typeClient: typeClient || "particulier",
      entreprise: entreprise || "",
      password, role, isActive
    });

    return res.status(201).json({
      message: role === "client" ? "Compte client créé. En attente de validation." : "Utilisateur créé et activé.",
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Mot de passe incorrect." });

    if (user.role === "client" && !user.isActive) {
      return res.status(403).json({ message: "Votre compte client n'est pas encore validé." });
    }

    const token = generateToken(user);
    res.json({ message: "Connexion réussie", token, role: user.role });
  } catch (err) {
    next(err);
  }
};
