import express from 'express';
import { createComment, getComments, deleteComment } from '../controllers/commentsController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", getComments);
router.post("/", protect, createComment);
router.delete("/:id", protect, deleteComment);
// router.post("/", createComment);
// router.delete("/:id", deleteComment);

export default router;