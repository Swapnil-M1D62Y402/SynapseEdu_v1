const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Alert routes placeholder"));

module.exports = router;
