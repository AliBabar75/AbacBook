import express from "express";
import { postSale } from "../controllers/sale.controller.js";
import { listSales } from "../controllers/sale.controller.js";
const router = express.Router();

router.post("/", postSale);
router.get("/", listSales);
export default router;
