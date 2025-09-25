// routes/summarizer.js
import express from 'express';
import summarizeController from '../controllers/summarizeController.js';

const router = express.Router();

router.post('/summarize', summarizeController.summarizeText);

export default router;