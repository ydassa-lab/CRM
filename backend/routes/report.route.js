// backend/routes/report.route.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const ctrl = require("../controllers/report.controller");

// Seul admin/manager peuvent consulter ces rapports

router.get(
  "/manager/overview",
  authMiddleware(["admin", "manager"]),
  ctrl.getManagerOverview
);
router.get("/manager/revenue-by-month", authMiddleware(["admin","manager"]), ctrl.revenueByMonth);
router.get("/manager/tickets-heatmap", authMiddleware(["admin","manager"]), ctrl.ticketsHeatmap);
router.get("/manager/top-performers", authMiddleware(["admin","manager"]), ctrl.topPerformers);

// Exports
router.get("/manager/export/pdf", authMiddleware(["admin","manager"]), ctrl.exportPDF);
router.get("/manager/export/excel", authMiddleware(["admin","manager"]), ctrl.exportExcel);

module.exports = router;
