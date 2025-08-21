import express from 'express';
import {addSources, createStudyKit} from '../controllers/studyKitController.js';
import protect from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, createStudyKit);
router.post('/source', protect, upload.array('files', 10), addSources); //Max of 10 files can be uploaded at once

export default router;
