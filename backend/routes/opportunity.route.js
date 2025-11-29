const express = require("express");
const router = express.Router();
const controller = require("../controllers/opportunity.controller");
const { authMiddleware } = require("../middlewares/auth");

// List, create, get, update, delete
router.get("/", authMiddleware(["admin","commercial"]), controller.list);
router.post("/", authMiddleware(["admin","commercial"]), controller.create);
router.get("/:id", authMiddleware(["admin","commercial"]), controller.get);
router.put("/:id", authMiddleware(["admin","commercial"]), controller.update);
router.delete("/:id", authMiddleware(["admin","commercial"]), controller.remove);

// quick stage change
router.patch("/:id/stage", authMiddleware(["admin","commercial"]), controller.changeStage);

module.exports = router;
