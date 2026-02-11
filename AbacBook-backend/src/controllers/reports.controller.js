import * as ReportService from "../services/report.service.js";

export async function trialBalance(req, res) {
  try {
    const { date } = req.query;
    const data = await ReportService.getTrialBalance(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function balanceSheet(req, res) {
  try {
    const { date } = req.query;
    const data = await ReportService.getBalanceSheet(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function profitLoss(req, res) {
  try {
    const { start, end } = req.query;
    const data = await ReportService.getProfitLoss(start, end);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
