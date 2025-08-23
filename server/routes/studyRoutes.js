// routes/studyRoutes.js
import express from "express";
import { chatRag, createTest, createFlashcard, summarizeText, createMcq } from "../controllers/studyController.js";

const router = express.Router();

router.post("/rag/chat", chatRag);
router.post("/test/create", createTest);
router.post("/flashcard/create", createFlashcard);
router.post("/summarizer", summarizeText);
router.post("/mcq/create", createMcq);

export default router;