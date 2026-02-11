import express from "express";
import {
  postSalesReturn,
  getSalesReturns,
} from "../controllers/salesReturn.controller.js";

const router = express.Router();

router.post("/", postSalesReturn);
router.get("/", getSalesReturns);

export default router;
