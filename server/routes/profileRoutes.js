const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Profile routes placeholder"));

module.exports = router;
