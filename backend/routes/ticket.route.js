const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth");
const ctrl = require("../controllers/ticket.controller");
const upload = require("../middlewares/upload");

/* ===========================
   LISTE TICKETS (tous rôles)
=========================== */
router.get("/", authMiddleware(), ctrl.list);

/* ===========================
   CRÉATION TICKET
   (client/admin/support)
   + Upload fichier
=========================== */
router.post(
  "/", 
  authMiddleware(["client", "admin", "support"]),
  upload.single("attachment"),
  ctrl.create
);

/* ===========================
   RÉPONSE À UN TICKET (tous)
   + upload
=========================== */
router.post(
  "/:id/reply",
  authMiddleware(),
  upload.single("attachment"),
  ctrl.reply
);

/* ===========================
   MODIFIER STATUT (admin/support)
=========================== */
router.put(
  "/:id/status",
  authMiddleware(["admin", "support"]),
  ctrl.updateStatus
);

/* ===========================
   GET UN SEUL TICKET
=========================== */
router.get(
  "/:id",
  authMiddleware(),
  ctrl.getOne
);

router.get("/:id/export/pdf", authMiddleware(), ctrl.exportPDF);
router.get("/:id/export/csv", authMiddleware(), ctrl.exportCSV);
router.get("/:id/export/excel", authMiddleware(), ctrl.exportExcel);


module.exports = router;
