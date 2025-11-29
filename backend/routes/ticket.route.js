// crm-backend/routes/ticket.route.js

const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth");
const ctrl = require("../controllers/ticket.controller");

// Tous les rôles connectés
router.get("/", authMiddleware(), ctrl.list);
router.post("/", authMiddleware(["client", "admin", "support"]), ctrl.create);

router.post("/:id/reply", authMiddleware(), ctrl.reply);

router.put("/:id/status", authMiddleware(["admin", "support"]), ctrl.updateStatus);

module.exports = router;
