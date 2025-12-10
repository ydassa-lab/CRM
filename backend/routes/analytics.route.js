// crm-backend/routes/analytics.route.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const ctrl = require("../controllers/analytics.controller");

// Seuls les rôles connectés peuvent lire les analytics;
// tu peux restreindre (ex: admin, manager)
router.get("/overview", authMiddleware(["admin","manager","support","commercial"]), ctrl.overview);
router.get("/tickets-over-time", authMiddleware(["admin","manager","support","commercial"]), ctrl.ticketsOverTime);
router.get("/ticket-status", authMiddleware(["admin","manager","support","commercial"]), ctrl.ticketStatus);
router.get("/opportunities-by-stage", authMiddleware(["admin","manager","commercial"]), ctrl.opportunitiesByStage);
router.get("/revenue-by-month", authMiddleware(["admin","manager","commercial"]), ctrl.revenueByMonth);

module.exports = router;
