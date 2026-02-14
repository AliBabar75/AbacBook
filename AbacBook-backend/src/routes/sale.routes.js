import express from "express";
import { postSale } from "../controllers/sale.controller.js";
import { listSales } from "../controllers/sale.controller.js";
import { receivePayment } from "../controllers/sale.controller.js";
import { refundSale } from "../controllers/sale.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/", postSale);
router.get("/", listSales);
router.post("/payment", authMiddleware, receivePayment);
router.post("/refund", authMiddleware, refundSale);
export default router;
