import { Router } from "express";
import {createPurchase,listPurchases,refundPurchase,getPurchaseById,payPurchase} from "../controllers/purchase.controller.js";


import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/", authMiddleware, createPurchase);
router.get("/", authMiddleware, listPurchases);
router.get("/:id", authMiddleware, getPurchaseById);
router.post("/payment", authMiddleware, payPurchase);
router.post("/refund", authMiddleware, refundPurchase);
export default router;
