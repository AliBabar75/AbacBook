import express from "express";
import { postSale } from "../controllers/sale.controller.js";
import { listSales } from "../controllers/sale.controller.js";
import { receivePayment } from "../controllers/sale.controller.js";
import { refundSale } from "../controllers/sale.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/", authMiddleware, postSale);
router.get("/", authMiddleware, listSales);
router.post("/payment", authMiddleware, receivePayment);
router.post("/refund", authMiddleware, refundSale);
export default router;
