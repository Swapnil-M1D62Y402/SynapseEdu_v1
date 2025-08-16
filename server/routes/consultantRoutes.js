import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { 
  getAllConsultants, 
  getConsultantById, 
  updateConsultantProfile,
  getConsultantProfile,
  getConsultantAppointments,
} from '../controllers/consultantController.js';

const router = express.Router();

router.get('/', getAllConsultants);
router.get('/profile', protect, getConsultantProfile);
router.get('/appointments', protect, getConsultantAppointments);
router.get('/:id', getConsultantById);
router.put('/profile', protect, updateConsultantProfile);

export default router;