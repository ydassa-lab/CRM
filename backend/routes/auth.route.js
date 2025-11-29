const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.controller");

// Public signup (anyone can choose a role). Clients will be inactive.
router.post("/signup", signup);

// Login
router.post("/login", login);

module.exports = router;
