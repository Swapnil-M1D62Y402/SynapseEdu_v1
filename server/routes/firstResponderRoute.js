import express from "express";
import { getFirstResponderSOS, resolveSOSMessage } from "../controllers/firstResponderController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/sos", protect, getFirstResponderSOS);
router.delete("/sos/:id", protect, resolveSOSMessage);
export default router;