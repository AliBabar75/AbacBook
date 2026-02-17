import express from "express";
import { dashboard } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();
router.get("/", authMiddleware,dashboard);
export default router;
