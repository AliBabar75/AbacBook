import SalesReturn from "../modules/salesReturn.model.js";
import SalesReturnItem from "../modules/salesReturnItem.model.js";
import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import PartyLedger from "../modules/partyLedger.model.js";

export const createSalesReturn = async (data) => {
  const { saleId, date, items, notes } = data;

  if (!items || items.length === 0) {
    throw new Error("Return items required");
  }

  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error("Sale not found");

  let totalAmount = 0;
  let totalTax = 0;

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
    if (!item) throw new Error("Item not found");

    const saleItem = await SaleItem.findOne({
      saleId,
      itemId: row.itemId,
    });

    if (!saleItem) throw new Error("Sale item not found");

    if (row.quantity > saleItem.quantity) {
      throw new Error("Return qty exceeds sold qty");
    }

    const amount = row.quantity * saleItem.rate;
    const tax = row.tax || 0;
    const cogs = row.quantity * item.avgCost;

    totalAmount += amount;
    totalTax += tax;

    await SalesReturnItem.create({
      salesReturnId: salesReturn._id,
      itemId: row.itemId,
      quantity: row.quantity,
      rate: saleItem.rate,
      amount,
      tax,
      cogs,
      reason: row.reason,
    });

    // 🔥 STOCK IN
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
  salesReturn.totalTax = totalTax;
  await salesReturn.save();

  // 🔥 CUSTOMER LEDGER REVERSE (CREDIT)
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
