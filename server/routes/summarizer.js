// routes/summarizer.js
const express = require('express');
const summarizerController = require('../controllers/summarizerController');

const router = express.Router();

router.post('/summarize', summarizerController.summarizeText);

export default router;