import express from 'express';
import {addSources, createStudyKit, addLinkSource, addTextSource} from '../controllers/studyKitController.js';
import protect from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, createStudyKit);
router.post('/source', protect, upload.array('files', 10), addSources); //Max of 10 files can be uploaded at once
router.post("/source/link", protect, addLinkSource);   // expects JSON { studyKitId, url, kind? }
router.post("/source/text", protect, addTextSource);   // expects JSON { studyKitId, text, title? }

// router.post('/', createStudyKit);
// router.post('/source', upload.array('files', 10), addSources); //Max of 10 files can be uploaded at once
// router.post("/source/link", addLinkSource);   // expects JSON { studyKitId, url, kind? }
// router.post("/source/text", addTextSource);   // expects JSON { studyKitId, text, title? }

export default router;
