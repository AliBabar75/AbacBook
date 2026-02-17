import express from "express";
import { setupOpeningBalance } from "../controllers/openingBalance.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/",authMiddleware,setupOpeningBalance);

export default router;
