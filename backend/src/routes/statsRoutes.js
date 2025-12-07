// src/routes/statsRoutes.js
import express from "express";
import { getStats } from "../controllers/statsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /stats  (protected)
router.get("/", authMiddleware, getStats);

export default router;
