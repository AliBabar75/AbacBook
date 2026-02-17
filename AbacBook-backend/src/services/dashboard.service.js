import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";
import Item from "../modules/item.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import { getInventoryClosingService } from "./inventoryClosing.service.js";
export const getDashboardData = async () => {

  const start = new Date();
  start.setDate(1);

  // Accounts
  const revenueAccount = await Account.findOne({ name: "Sale Revenue" });
  const apAccount = await Account.findOne({ name: "Accounts Payable" });
  const arAccount = await Account.findOne({ name: "Accounts Receivable" });

  // 🔹 Total Sales (This Month)
 const salesEntries = await Ledger.find({
  date: { $gte: start },
  $or: [
    { creditAccount: revenueAccount?._id },
    { debitAccount: revenueAccount?._id }
  ]
});

let totalSales = 0;

for (const entry of salesEntries) {

  if (entry.creditAccount.toString() === revenueAccount?._id.toString()) {
    totalSales += entry.amount;
  }

  if (entry.debitAccount.toString() === revenueAccount?._id.toString()) {
    totalSales -= entry.amount;
  }
}

  // const totalSales = salesEntries.reduce((sum, e) => sum + e.amount, 0);

  // 🔹 Total Purchases (This Month)
  const purchaseEntries = await Ledger.find({
    date: { $gte: start },
    creditAccount: apAccount?._id
  });

  const totalPurchases = purchaseEntries.reduce((sum, e) => sum + e.amount, 0);

  // 🔹 Inventory Value
  // const items = await Item.find();
  // const inventoryValue = items.reduce(
  //   (sum, item) => sum + (item.quantity * item.avgCost),
  //   0
  // );
const closing = await getInventoryClosingService({
  asOfDate: new Date(),
  itemType: "all",
});

const inventoryValue = closing.totalValue;
  // 🔹 Accounts Receivable Balance
  const arEntries = await Ledger.find({
    $or: [
      { debitAccount: arAccount?._id },
      { creditAccount: arAccount?._id }
    ]
  });

  let receivable = 0;
  for (const entry of arEntries) {
    if (entry.debitAccount.toString() === arAccount?._id.toString()) {
      receivable += entry.amount;
    }
    if (entry.creditAccount.toString() === arAccount?._id.toString()) {
      receivable -= entry.amount;
    }
  }

  // 🔹 Accounts Payable Balance
  const apEntries = await Ledger.find({
    $or: [
      { debitAccount: apAccount?._id },
      { creditAccount: apAccount?._id }
    ]
  });

  let payable = 0;
  for (const entry of apEntries) {
    if (entry.creditAccount.toString() === apAccount?._id.toString()) {
      payable += entry.amount;
    }
    if (entry.debitAccount.toString() === apAccount?._id.toString()) {
      payable -= entry.amount;
    }
  }

  // 🔹 Recent Transactions
  const transactions = await InventoryTransaction.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("item", "name");

  const recentTransactions = transactions.map(t => ({
    date: new Date(t.createdAt).toLocaleDateString(),
    type: t.type,
    party: t.item?.name || "—",
    amount: t.totalAmount
  }));

  return {
    stats: {
      totalSales,
      totalPurchases,
      inventoryValue,
      receivable,
      payable
    },
    recentTransactions
  };
};
