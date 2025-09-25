// routes/test.js
import express from 'express';
import testController from '../controllers/testController.js';

const router = express.Router();

router.post('/create', testController.createTest);

export default router;