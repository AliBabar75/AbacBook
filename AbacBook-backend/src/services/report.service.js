import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";


// =======================================================
// 1️⃣ TRIAL BALANCE
// =======================================================

export const getTrialBalance = async (asOfDate) => {
  const date = asOfDate
  ? new Date(new Date(asOfDate).setHours(23, 59, 59, 999))
  : new Date();

  const entries = await Ledger.find({
    date: { $lte: date },
  }).populate("debitAccount creditAccount");

  const balances = {};

  for (const entry of entries) {
    const debitId = entry.debitAccount._id.toString();
    const creditId = entry.creditAccount._id.toString();

    balances[debitId] = (balances[debitId] || 0) + entry.amount;
    balances[creditId] = (balances[creditId] || 0) - entry.amount;
  }

  const accounts = await Account.find();

  const result = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const acc of accounts) {
    const balance = balances[acc._id.toString()] || 0;

    if (balance > 0) {
      result.push({
        code: acc.code,
        name: acc.name,
        debit: balance,
        credit: 0,
      });
      totalDebit += balance;
    } else if (balance < 0) {
      result.push({
        code: acc.code,
        name: acc.name,
        debit: 0,
        credit: Math.abs(balance),
      });
      totalCredit += Math.abs(balance);
    }
  }

  return {
    accounts: result,
    totalDebit,
    totalCredit,
  };
};




// =======================================================
// 2️⃣ PROFIT & LOSS
// =======================================================
export const getProfitLoss = async (startDate, endDate) => {

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate
    ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
    : new Date();

  // ================================
  // OPENING INVENTORY
  // ================================
  const openingInventoryAgg = await InventoryTransaction.aggregate([
    { $match: { createdAt: { $lt: start } } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" }
      }
    }
  ]);

  const openingInventory = openingInventoryAgg[0]?.total || 0;

  // ================================
  // PURCHASES
  // ================================
  const purchasesAgg = await InventoryTransaction.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        type: "IN",
        reference: "PURCHASE"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" }
      }
    }
  ]);

  const purchases = purchasesAgg[0]?.total || 0;

  // ================================
  // CLOSING INVENTORY
  // ================================
  const closingInventoryAgg = await Item.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ["$quantity", "$avgCost"] } }
      }
    }
  ]);

  const closingInventory = closingInventoryAgg[0]?.total || 0;

  // ================================
  // LEDGER BASED CALCULATION
  // ================================
  const entries = await Ledger.find({
    date: { $gte: start, $lte: end }
  }).populate("debitAccount creditAccount");

  let totalSales = 0;
  let totalReturns = 0;

  let totalCOGS = 0;
  let totalCOGSReverse = 0;

  let salaries = 0;
  let rent = 0;
  let utilities = 0;
  let otherExpenses = 0;

  for (const entry of entries) {

    // SALES
    if (entry.creditAccount?.type === "INCOME") {
      totalSales += entry.amount;
    }

    // SALES RETURNS
    if (entry.debitAccount?.type === "INCOME") {
      totalReturns += entry.amount;
    }

    // COGS
    if (entry.debitAccount?.name === "Cost of Goods Sold") {
      totalCOGS += entry.amount;
    }

    if (entry.creditAccount?.name === "Cost of Goods Sold") {
      totalCOGSReverse += entry.amount;
    }

    // OPERATING EXPENSE BREAKDOWN
    if (entry.debitAccount?.name === "Salaries & Wages") {
      salaries += entry.amount;
    }

    if (entry.debitAccount?.name === "Rent") {
      rent += entry.amount;
    }

    if (entry.debitAccount?.name === "Utilities") {
      utilities += entry.amount;
    }

    if (entry.debitAccount?.name === "Other Expenses") {
      otherExpenses += entry.amount;
    }
  }

  const netRevenue = totalSales - totalReturns;
  const netCOGS = totalCOGS - totalCOGSReverse;

  const totalExpenses = salaries + rent + utilities + otherExpenses;

  const grossProfit = netRevenue - netCOGS;
  const netProfit = grossProfit - totalExpenses;

  return {
    revenue: {
      sales: totalSales,
      returns: totalReturns,
      netRevenue
    },

    costOfSales: {
      openingInventory,
      purchases,
      closingInventory,
      costOfGoodsSold: netCOGS
    },

    grossProfit,

    expenses: {
      salaries,
      rent,
      utilities,
      other: otherExpenses,
      totalExpenses
    },

    netProfit
  };
};



// =======================================================
// 3️⃣ BALANCE SHEET
// =======================================================
export const getBalanceSheet = async (asOfDate) => {

  const date = asOfDate
  ? new Date(new Date(asOfDate).setHours(23, 59, 59, 999))
  : new Date();
  const entries = await Ledger.find({
    date: { $lte: date }
  }).populate("debitAccount creditAccount");

  const balances = {};

  for (const entry of entries) {

    const debitId = entry.debitAccount._id.toString();
    const creditId = entry.creditAccount._id.toString();

    balances[debitId] = (balances[debitId] || 0) + entry.amount;
    balances[creditId] = (balances[creditId] || 0) - entry.amount;
  }

  const accounts = await Account.find();

  let cash = 0;
  let receivable = 0;
  let inventory = 0;

  let payable = 0;

  let capital = 0;
  let retainedEarnings = 0;

  for (const acc of accounts) {

  const balance = balances[acc._id.toString()] || 0;

  // Assets
  if (acc.type === "ASSET") {
    if (acc.name === "Cash") cash = balance;
    if (acc.name === "Accounts Receivable") receivable = balance;
    if (acc.name === "Inventory") inventory = balance;
  }

  // Liabilities
  if (acc.type === "LIABILITY") {
    if (acc.name === "Accounts Payable") payable = Math.abs(balance);
  }

  // Equity
  if (acc.type === "EQUITY") {
    if (acc.name === "Owner Capital") capital = Math.abs(balance);
  }

  // Income
  if (acc.type === "INCOME") {
    retainedEarnings += Math.abs(balance);
  }

  // Expense
  if (acc.type === "EXPENSE") {
    retainedEarnings -= balance;
  }
}

  const totalAssets = cash + receivable + inventory;
  const totalLiabilities = payable;
  const totalEquity = capital + retainedEarnings;

  return {
    assets: {
      cash,
      receivable,
      inventory,
      totalAssets
    },
    liabilities: {
      payable,
      totalLiabilities
    },
    equity: {
      capital,
      retainedEarnings,
      totalEquity
    }
  };
};
