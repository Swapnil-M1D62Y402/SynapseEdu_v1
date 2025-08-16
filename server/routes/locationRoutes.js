import express from 'express';
import { saveLocation, getLatestLocation } from '../controllers/locationController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, saveLocation);
router.get('/', protect, getLatestLocation);

export default router;