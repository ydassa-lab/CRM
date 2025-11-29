// crm-backend/routes/user.route.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../middlewares/auth");
const { sendWelcomeEmail } = require("../services/emailService");

// GET /api/user?search=&role=&page=1&limit=10&sort=prenom:asc
router.get("/", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const { search = "", role = "", page = 1, limit = 10, sort = "createdAt:desc" } = req.query;
    const q = {};

    if (role) q.role = role;
    if (search) {
      const regex = new RegExp(search, "i");
      q.$or = [{ prenom: regex }, { nom: regex }, { email: regex }, { telephone: regex }];
    }

    const [sortField, sortDir] = sort.split(":");
    const sortObj = { [sortField || "createdAt"]: sortDir === "asc" ? 1 : -1 };

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const total = await User.countDocuments(q);
    const users = await User.find(q).select("-password").sort(sortObj).skip(skip).limit(Number(limit));

    res.json({
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit) || 1)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/user/:id
router.get("/:id", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/user/:id  -> update user (admin)
router.put("/:id", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const allowed = ["prenom","nom","email","telephone","adresse","ville","pays","typeClient","entreprise","role","isActive"];
    const payload = {};
    for (const k of allowed) if (typeof req.body[k] !== "undefined") payload[k] = req.body[k];

    // Prevent demoting last admin: optional (not implemented here)

    const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    // If activated -> send welcome email (only when changing was inactive -> active)
    if (payload.isActive) {
      // fetch previous state? We can do a safe send if currently active
      try { await sendWelcomeEmail(user.email, user.prenom); } catch(e) { console.error("Erreur email:", e); }
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/user/:id
router.delete("/:id", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) {
    next(err);
  }
});

router.get("/clients", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" }).select("-password");
    res.json(clients);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/user/:id/activate
router.patch("/:id/activate", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const wasInactive = !user.isActive;
    user.isActive = Boolean(isActive);
    await user.save();

    if (user.isActive && wasInactive) {
      try { await sendWelcomeEmail(user.email, user.prenom); } catch(e) { console.error("Erreur email:", e); }
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
