// routes/ingestion.js
import express from 'express';
import ingestionController from '../controllers/ingestionController.js';

const router = express.Router();

router.post('/pending', ingestionController.ingestPendingSources);
router.post('/study-kit', ingestionController.ingestStudyKitSources);
router.post('/background/pending', ingestionController.ingestPendingSourcesBackground);
router.post('/background/study-kit', ingestionController.ingestStudyKitBackground);
router.get('/status', ingestionController.getIngestionStatus);

export default router;