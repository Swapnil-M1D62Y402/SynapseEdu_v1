// routes/test.js
const express = require('express');
const testController = require('../controllers/testController');

const router = express.Router();

router.post('/create', testController.createTest);

export default router;