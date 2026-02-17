import express from "express";
import {
  postSalesReturn,
  getSalesReturns,
} from "../controllers/salesReturn.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/", authMiddleware, postSalesReturn);
router.get("/", authMiddleware, getSalesReturns);

export default router;
