// routes/flashcard.js
import express from 'express';
import flashcardController from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/create', flashcardController.createFlashcards);

export default router;