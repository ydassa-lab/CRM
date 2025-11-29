// crm-backend/routes/prospect.route.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const controller = require("../controllers/prospect.controller");

// Tous accès pour commerciaux et admin (tu peux ajuster roles)
router.get("/", authMiddleware(["admin","commercial"]), controller.list);
router.post("/", authMiddleware(["admin","commercial"]), controller.create);
router.get("/:id", authMiddleware(["admin","commercial"]), controller.get);
router.put("/:id", authMiddleware(["admin","commercial"]), controller.update);
router.delete("/:id", authMiddleware(["admin","commercial"]), controller.remove);

// convert prospect -> user (client)
router.post("/:id/convert", authMiddleware(["admin","commercial"]), controller.convert);

module.exports = router;
