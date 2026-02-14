import SalesReturn from "../modules/salesReturn.model.js";
import SalesReturnItem from "../modules/salesReturnItem.model.js";
import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";

export const createSalesReturn = async (data) => {
  const { saleId, date, items, notes } = data;

  if (!items || items.length === 0) {
    throw new Error("Return items required");
  }

  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error("Sale not found");

  const revenueAccount = await Account.findOne({ name: "Sale Revenue" });
  const arAccount = await Account.findOne({ name: "Accounts Receivable" });
  const cogsAccount = await Account.findOne({ name: "Cost of Goods Sold" });
  const inventoryAccount = await Account.findOne({ name: "Inventory" });

  let totalAmount = 0;
  let totalCOGS = 0;

  const salesReturn = await SalesReturn.create({
    returnNo: `SR-${Date.now()}`,
    saleId,
    customerId: sale.customerId,
    date,
    notes,
    totalAmount: 0,
    totalTax: 0,
  });

  for (const row of items) {
    const item = await Item.findById(row.itemId);
    const saleItem = await SaleItem.findOne({ saleId, itemId: row.itemId });

    const amount = row.quantity * saleItem.rate;
    const cogs = row.quantity * item.avgCost;

    totalAmount += amount;
    totalCOGS += cogs;

    await SalesReturnItem.create({
      salesReturnId: salesReturn._id,
      itemId: row.itemId,
      quantity: row.quantity,
      rate: saleItem.rate,
      amount,
      cogs,
    });

    item.quantity += row.quantity;
    await item.save();

    await InventoryTransaction.create({
      item: item._id,
      type: "IN",
      quantity: row.quantity,
      unitCost: item.avgCost,
      totalAmount: cogs,
      reference: "SALES_RETURN",
    });
  }

  salesReturn.totalAmount = totalAmount;
  await salesReturn.save();

// CUSTOMER LEDGER REVERSE (CREDIT)
const lastLedger = await PartyLedger.findOne({
  partyId: sale.customerId,
  partyType: "customer",
}).sort({ createdAt: -1 });

const previousBalance = lastLedger?.balanceAfter || 0;
const newBalance = previousBalance - totalAmount;

await PartyLedger.create({
  partyId: sale.customerId,
  partyType: "customer",
  refType: "SALES_RETURN",
  refId: salesReturn._id,
  debit: 0,
  credit: totalAmount,
  balanceAfter: newBalance,
});

  // Revenue Reverse
  await Ledger.create({
    description: "Sales Return - Revenue Reverse",
    date,
    debitAccount: revenueAccount._id,
    creditAccount: arAccount._id,
    amount: totalAmount,
  });

  // COGS Reverse
  await Ledger.create({
    description: "Sales Return - COGS Reverse",
    date,
    debitAccount: inventoryAccount._id,
    creditAccount: cogsAccount._id,
    amount: totalCOGS,
  });

  return salesReturn;
};
export const listSalesReturns = async () => {
  const returns = await SalesReturn.find()
    .populate("saleId", "invoiceNo")
    .populate("customerId", "name")
    .sort({ createdAt: -1 })
    .lean();

  for (const r of returns) {
    const items = await SalesReturnItem.find({
      salesReturnId: r._id,
    }).populate("itemId", "name");

    r.items = items;
  }

  return returns;
};
