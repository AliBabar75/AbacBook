import Sale from "../modules/sale.model.js";
import Purchase from "../modules/purchase.model.js";
import Item from "../modules/item.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";

export const getDashboardData = async () => {

  const start = new Date();
  start.setDate(1);
    
  const totalSales = await Sale.aggregate([
    { $match: { date: { $gte: start } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  const totalPurchases = await Purchase.aggregate([
    { $match: { date: { $gte: start } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  const inventoryValue = await Item.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$avgCost"] } } } }
  ]);

  const receivable = await PartyLedger.aggregate([
    { $match: { partyType: "customer" } },
    { $group: { _id: null, total: { $sum: "$balanceAfter" } } }
  ]);

  const payable = await PartyLedger.aggregate([
    { $match: { partyType: "supplier" } },
    { $group: { _id: null, total: { $sum: "$balanceAfter" } } }
  ]);

  const recentTransactions = await InventoryTransaction.find()
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalSales: totalSales[0]?.total || 0,
    totalPurchases: totalPurchases[0]?.total || 0,
    inventoryValue: inventoryValue[0]?.total || 0,
    receivable: receivable[0]?.total || 0,
    payable: payable[0]?.total || 0,
    recentTransactions
  };
};
