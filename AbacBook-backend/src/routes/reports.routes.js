import express from "express";
import {
  trialBalance,
  profitLoss,
  balanceSheet
} from "../controllers/reports.controller.js";


const router = express.Router();

router.get("/trial-balance", trialBalance);
router.get("/profit-loss", profitLoss);
router.get("/balance-sheet", balanceSheet);

export default router;
