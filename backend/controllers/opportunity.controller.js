const Opportunity = require("../models/Opportunity");
const Prospect = require("../models/Prospect");

exports.list = async (req, res, next) => {
  try {
    const { search = "", stage = "", page = 1, limit = 10, sort = "createdAt:desc", assignedTo = "" } = req.query;
    const q = {};

    // Option: restrict to createdBy or assignedTo for commercial (you can relax)
    // if (req.user.role === "commercial") q.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];

    if (stage) q.stage = stage;
    if (assignedTo) q.assignedTo = assignedTo;
    if (search) {
      const r = new RegExp(search, "i");
      q.$or = [{ title: r }];
    }

    const [field, dir] = sort.split(":");
    const sortObj = { [field || "createdAt"]: dir === "asc" ? 1 : -1 };
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const total = await Opportunity.countDocuments(q);
    const data = await Opportunity.find(q)
      .populate("prospect", "prenom nom email telephone")
      .populate("createdBy", "prenom nom")
      .populate("assignedTo", "prenom nom")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({ data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total/Number(limit) || 1) } });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const o = await Opportunity.findById(req.params.id)
      .populate("prospect", "prenom nom email telephone")
      .populate("createdBy", "prenom nom")
      .populate("assignedTo", "prenom nom email");
    if (!o) return res.status(404).json({ message: "Opportunité introuvable" });
    res.json(o);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user.id };
    const opp = await Opportunity.create(payload);
    res.status(201).json(opp);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!opp) return res.status(404).json({ message: "Opportunité introuvable" });
    res.json(opp);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ message: "Opportunité introuvable" });
    res.json({ message: "Opportunité supprimée" });
  } catch (err) { next(err); }
};

// Change stage quickly (PATCH)
exports.changeStage = async (req, res, next) => {
  try {
    const { stage } = req.body;
    const valid = ["Découverte","Proposition","Négociation","Gagné","Perdu"];
    if (!valid.includes(stage)) return res.status(400).json({ message: "Stage invalide" });
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { stage }, { new: true });
    if (!opp) return res.status(404).json({ message: "Opportunité introuvable" });
    res.json(opp);
  } catch (err) { next(err); }
};
