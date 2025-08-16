import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { 
  createAppointment, 
  getUserAppointments ,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/user', protect, getUserAppointments);
router.put('/:appointmentId/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, deleteAppointment);

export default router;