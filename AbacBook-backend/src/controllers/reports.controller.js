import { generateTrialBalance } from "../reports/trialBalance.service.js";
import { generateProfitLoss } from "../reports/profitLoss.service.js";
import { generateBalanceSheet } from "../reports/balanceSheet.service.js";

export const trialBalance = async (req, res, next) => {
  try {
    const data = await generateTrialBalance();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const profitLoss = async (req, res, next) => {
  try {
    const data = await generateProfitLoss();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const balanceSheet = async (req, res, next) => {
  try {
    const data = await generateBalanceSheet();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
