import { Router } from "express";
import {
  createPurchase,
  listPurchases,
} from "../controllers/purchase.controller.js";
import { getPurchaseById } from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/", authMiddleware, createPurchase);
router.get("/", authMiddleware, listPurchases);
router.get("/:id", authMiddleware, getPurchaseById);
export default router;
