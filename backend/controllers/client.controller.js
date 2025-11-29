const Client = require("../models/Client");

exports.list = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10, sort = "createdAt:desc" } = req.query;

    const q = {};
    if (search) {
      const r = new RegExp(search, "i");
      q.$or = [{ prenom: r }, { nom: r }, { email: r }];
    }

    const [field, direction] = sort.split(":");
    const sortObj = { [field]: direction === "asc" ? 1 : -1 };

    const total = await Client.countDocuments(q);
    const data = await Client.find(q)
      .populate("prospectId", "prenom nom email")
      .populate("createdBy", "prenom nom")
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });

  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("prospectId")
      .populate("createdBy", "prenom nom")
      .populate("opportunities");

    if (!client) return res.status(404).json({ message: "Client introuvable" });
    res.json(client);

  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user.id };
    const client = await Client.create(payload);
    res.status(201).json(client);

  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Client introuvable" });
    res.json(updated);

  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const removed = await Client.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Client introuvable" });
    res.json({ message: "Client supprimé" });

  } catch (err) { next(err); }
};
