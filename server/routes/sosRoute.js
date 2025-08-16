import e from "express";
import { sendSOS } from "../controllers/messageController.js";
import protect from "../middlewares/authMiddleware.js"
import express from "express"

const router = express.Router()

router.post('/sendsos', protect, sendSOS)

export default router