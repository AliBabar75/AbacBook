import api from "./api.js";

export const trialBalance = () => api.get("/reports/trial-balance");
export const profitLoss = () => api.get("/reports/profit-loss");
export const balanceSheet = () => api.get("/reports/balance-sheet");
