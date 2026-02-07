import { Router } from "express";
import {
  createPurchase,
  listPurchases,
} from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/", authMiddleware, listPurchases);
router.post("/", authMiddleware, createPurchase);

export default router;
