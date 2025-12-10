const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth");
const Notification = require("../models/Notification");

// Liste des notifications
router.get("/", authMiddleware(), async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json(notifs);
});

// Marquer comme lu
router.put("/:id/read", authMiddleware(), async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// Tout lire
router.put("/read/all", authMiddleware(), async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ success: true });
});

module.exports = router;
