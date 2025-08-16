import express from "express"
import protect from "../middlewares/authMiddleware.js";
import { updateTrustedEmail, getTrustedEmail } from "../controllers/trustedemailController.js";
const router = express.Router()

router.put('/', protect, updateTrustedEmail);
router.get('/', protect, getTrustedEmail);

export default router;