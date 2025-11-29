const express = require("express");
const router = express.Router();
const controller = require("../controllers/client.controller");
const { authMiddleware } = require("../middlewares/auth");

router.get("/", authMiddleware(["admin","commercial"]), controller.list);
router.post("/", authMiddleware(["admin","commercial"]), controller.create);
router.get("/:id", authMiddleware(["admin","commercial"]), controller.get);
router.put("/:id", authMiddleware(["admin","commercial"]), controller.update);
router.delete("/:id", authMiddleware(["admin","commercial"]), controller.remove);

module.exports = router;
