const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");
const ctr = require("../controllers/invoice.controller");

router.post(
  "/",
  authMiddleware(["admin", "commercial"]),
  ctr.createInvoice
);

router.get("/", authMiddleware(), ctr.getInvoices);

router.get("/:id", authMiddleware(), ctr.getInvoice);

router.put(
  "/:id/status",
  authMiddleware(["admin", "commercial"]),
  ctr.updateStatus
);

router.post("/:id/payment", authMiddleware(), ctr.addPayment);

router.get("/:id/pdf", authMiddleware(), ctr.generatePDF);
router.get("/:id/excel", authMiddleware(), ctr.exportExcel);
router.get("/:id/csv", authMiddleware(), ctr.exportCSV);
router.get("/stats", authMiddleware(["admin", "commercial"]), ctr.getStats);


module.exports = router;
