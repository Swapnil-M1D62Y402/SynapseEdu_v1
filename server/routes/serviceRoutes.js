const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Service provider routes placeholder"));

module.exports = router;
