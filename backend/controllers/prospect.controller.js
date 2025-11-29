// crm-backend/controllers/prospect.controller.js
const Prospect = require("../models/Prospect");
const User = require("../models/User");

exports.list = async (req, res, next) => {
  try {
    const { search = "", statut = "", page = 1, limit = 10, sort = "createdAt:desc" } = req.query;
    const q = {};
    if (statut) q.statut = statut;
    if (search) {
      const r = new RegExp(search, "i");
      q.$or = [{ prenom: r }, { nom: r }, { email: r }, { telephone: r }];
    }
    const [field, dir] = sort.split(":");
    const sortObj = { [field || "createdAt"]: dir === "asc" ? 1 : -1 };
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const total = await Prospect.countDocuments(q);
    const data = await Prospect.find(q).populate("assignedTo", "prenom nom email").sort(sortObj).skip(skip).limit(Number(limit));
    res.json({ data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total/Number(limit) || 1) } });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const p = await Prospect.findById(req.params.id).populate("assignedTo", "prenom nom email");
    if (!p) return res.status(404).json({ message: "Prospect introuvable" });
    res.json(p);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body;
    const prospect = await Prospect.create(payload);
    res.status(201).json(prospect);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const payload = req.body;
    const p = await Prospect.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!p) return res.status(404).json({ message: "Prospect introuvable" });
    res.json(p);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const p = await Prospect.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Prospect introuvable" });
    res.json({ message: "Supprimé" });
  } catch (err) { next(err); }
};

// Convertir un prospect en client: crée un User role=client isActive=false
exports.convert = async (req, res, next) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ message: "Prospect introuvable" });

    // check existing user by email (if no email -> cannot create user)
    if (!prospect.email) return res.status(400).json({ message: "Le prospect n'a pas d'email; impossible de convertir." });

    const exist = await User.findOne({ email: prospect.email });
    if (exist) {
      // mark prospect as Converti but do not duplicate user
      prospect.statut = "Converti";
      prospect.convertedAt = new Date();
      await prospect.save();
      return res.json({ message: "Prospect marqué converti mais utilisateur existant déjà.", userId: exist._id });
    }

    // create user with minimal fields; password temporaire aléatoire (admin pourra redemander reset)
    const randomPassword = Math.random().toString(36).slice(-8);
    const newUser = await User.create({
      prenom: prospect.prenom,
      nom: prospect.nom,
      email: prospect.email,
      telephone: prospect.telephone || "",
      role: "client",
      isActive: false,
      password: randomPassword,
      entreprise: "" // could be extended
    });

    prospect.statut = "Converti";
    prospect.convertedAt = new Date();
    await prospect.save();

    // NOTE: in production you would send an email to the client to set password or notify admin.
    res.json({ message: "Prospect converti en client (compte créé, inactif).", userId: newUser._id });
  } catch (err) { next(err); }
};
