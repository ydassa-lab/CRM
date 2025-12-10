const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const controller = require("../controllers/clientUser.controller");

router.get("/", authMiddleware(["admin", "commercial"]), controller.listClientUsers);

module.exports = router;
