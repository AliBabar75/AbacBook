import express from "express";
// import { createPurchaseReturn } from "../controllers/purchaseReturn.controller.js";
import { createPurchaseReturn, listPurchaseReturns } from "../controllers/purchaseReturn.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();
router.post("/", authMiddleware, createPurchaseReturn);
router.get("/", listPurchaseReturns);

export default router;
