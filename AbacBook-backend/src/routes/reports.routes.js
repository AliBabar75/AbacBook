import express from "express";
import {
  trialBalance,
  balanceSheet,
  profitLoss,
} from "../controllers/reports.controller.js";

const router = express.Router();

router.get("/trial-balance", trialBalance);
router.get("/balance-sheet", balanceSheet);
router.get("/profit-loss", profitLoss);

export default router;
