import express from "express";
const router = express.Router();

import { 
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser
} from '../controllers/authController.js'
import protect from '../middlewares/authMiddleware.js'

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile); //protected route

export default router;
