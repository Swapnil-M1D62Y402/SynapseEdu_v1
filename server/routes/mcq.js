// routes/mcq.js
const express = require('express');
const mcqController = require('../controllers/mcqController');

const router = express.Router();

router.post('/create', mcqController.createMCQs);

export default router;