// routes/flashcard.js
const express = require('express');
const flashcardController = require('../controllers/flashcardController');

const router = express.Router();

router.post('/create', flashcardController.createFlashcards);

export default router;