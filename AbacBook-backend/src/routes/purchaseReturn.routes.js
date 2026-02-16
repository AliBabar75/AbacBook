import express from "express";
import { createPurchaseReturn, listPurchaseReturns } from "../controllers/purchaseReturn.controller.js";
import { refundPurchaseReturn } from "../controllers/purchaseReturn.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();
router.post("/", authMiddleware, createPurchaseReturn);
router.get("/", authMiddleware, listPurchaseReturns);

router.post("/refund",refundPurchaseReturn);
export default router;
