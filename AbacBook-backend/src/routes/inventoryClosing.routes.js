import express from "express";
import { getInventoryClosing } from "../controllers/inventoryClosing.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.get("/",authMiddleware, getInventoryClosing);

export default router;
