import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Customer from "../modules/customer.model.js";


// =======================================================
// 1️⃣ TRIAL BALANCE
// =======================================================

export const getTrialBalance = async (asOfDate) => {
  const date = asOfDate ? new Date(asOfDate) : new Date();

  const ledgerEntries = await PartyLedger.aggregate([
    { $match: { createdAt: { $lte: date } } },
    {
      $group: {
        _id: "$partyId",
        debit: { $sum: "$debit" },
        credit: { $sum: "$credit" },
      },
    },
  ]);

  const accounts = [];

  for (const entry of ledgerEntries) {
    const customer = await Customer.findById(entry._id);

    accounts.push({
      code: customer?.code || "—",
      name: customer?.name || "Unknown",
      debit: entry.debit || 0,
      credit: entry.credit || 0,
    });
  }

  const totalDebit = accounts.reduce((a, b) => a + b.debit, 0);
  const totalCredit = accounts.reduce((a, b) => a + b.credit, 0);

  return {
    accounts,
    totalDebit,
    totalCredit,
  };
};



// =======================================================
// 2️⃣ PROFIT & LOSS
// =======================================================

export const getProfitLoss = async (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  const dateFilter = { $gte: start, $lte: end };

  // Revenue
  const sales = await Sale.find({ date: dateFilter });
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // COGS
  const saleItems = await SaleItem.find({ createdAt: dateFilter });
  const totalCOGS = saleItems.reduce((sum, s) => sum + (s.cogs || 0), 0);

  const grossProfit = totalRevenue - totalCOGS;

  // Expenses (future ready)
  const totalExpenses = 0;

  const netProfit = grossProfit - totalExpenses;

  return {
    revenue: {
      sales: totalRevenue,
      totalRevenue,
    },
    cogs: {
      totalCOGS,
    },
    grossProfit,
    expenses: {
      totalExpenses,
    },
    netProfit,
  };
};



// =======================================================
// 3️⃣ BALANCE SHEET
// =======================================================

export const getBalanceSheet = async (asOfDate) => {
  const date = asOfDate ? new Date(asOfDate) : new Date();

  // 1️⃣ Accounts Receivable / Payable
  const ledgerSummary = await PartyLedger.aggregate([
    { $match: { createdAt: { $lte: date } } },
    {
      $group: {
        _id: "$partyId",
        balance: { $sum: { $subtract: ["$debit", "$credit"] } },
      },
    },
  ]);

  const totalReceivable = ledgerSummary
    .filter(l => l.balance > 0)
    .reduce((sum, l) => sum + l.balance, 0);

  const totalPayable = ledgerSummary
    .filter(l => l.balance < 0)
    .reduce((sum, l) => sum + Math.abs(l.balance), 0);

  // 2️⃣ Inventory
  const items = await Item.find();
  const inventoryValue = items.reduce(
    (sum, i) => sum + (i.quantity || 0) * (i.avgCost || 0),
    0
  );

  // 3️⃣ Retained Earnings (Net Profit till date)
  const sales = await Sale.find({ date: { $lte: date } });
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const saleItems = await SaleItem.find({ createdAt: { $lte: date } });
  const totalCOGS = saleItems.reduce((sum, s) => sum + (s.cogs || 0), 0);

  const retainedEarnings = totalRevenue - totalCOGS;

  const totalAssets = totalReceivable + inventoryValue;
  const totalLiabilities = totalPayable;
  const totalEquity = retainedEarnings;

  return {
    assets: {
      receivable: totalReceivable,
      inventory: inventoryValue,
      totalAssets,
    },
    liabilities: {
      payable: totalPayable,
      totalLiabilities,
    },
    equity: {
      retainedEarnings,
      totalEquity,
    },
  };
};
