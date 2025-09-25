// routes/mcq.js
import express from 'express';
import mcqController from '../controllers/mcqController.js';

const router = express.Router();

router.post('/create', mcqController.createMCQs);

export default router;