// routes/rag.js
const express = require('express');
const ragController = require('../controllers/ragController');

const router = express.Router();

router.post('/chat', ragController.chatWithRAG);

export default router;