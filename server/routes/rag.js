// routes/rag.js
import express from 'express';
import ragController from '../controllers/ragController.js';

const router = express.Router();

router.post('/chat', ragController.chatWithRAG);

export default router;