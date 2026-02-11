import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import PartyLedger from "../modules/partyLedger.model.js";

export const createSale = async (data) => {
  const { date, invoiceNo, customerId, items, notes } = data;

  if (!items || items.length === 0) {
    throw new Error("Sale items required");
  }

  let totalAmount = 0;

  // 1️⃣ VALIDATION + TOTAL
  for (const row of items) {
    const item = await Item.findById(row.itemId);

    if (!item) throw new Error("Item not found");

    // if (item.type !== "FINISHED_GOOD") {
    //   throw new Error(`${item.name} is not a finished good`);
    // }

    if (item.quantity < row.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    totalAmount += row.quantity * row.rate;
  }

  // 2️⃣ SALE CREATE
  const sale = await Sale.create({
    date,
    invoiceNo,
    customerId,
    notes,
    totalAmount,
    status: "UNPAID",
  });

  // 3️⃣ SALE ITEMS + STOCK OUT
  for (const row of items) {
    const item = await Item.findById(row.itemId);

    const amount = row.quantity * row.rate;
    const cogs = row.quantity * item.avgCost;

    await SaleItem.create({
      saleId: sale._id,
      itemId: item._id,
      quantity: row.quantity,
      rate: row.rate,
      amount,
      cogs,
    });

    // stock minus
    item.quantity -= row.quantity;
    await item.save();

    // inventory transaction
    await InventoryTransaction.create({
      item: item._id,
      type: "OUT",
      quantity: row.quantity,
      unitCost: item.avgCost,
      totalAmount: cogs,
      reference: "SALE",
    });
  }

  // 4️⃣ CUSTOMER LEDGER (DEBIT)
  const lastLedger = await PartyLedger.findOne({
    partyId: customerId,
    partyType: "customer",
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger?.balanceAfter || 0;
  const newBalance = previousBalance + totalAmount;

  await PartyLedger.create({
    partyId: customerId,
    partyType: "customer",
    refType: "SALE",
    refId: sale._id,
    debit: totalAmount,
    credit: 0,
    balanceAfter: newBalance,
  });

  return sale;
};
export const getSales = async () => {
  const sales = await Sale.find()
    .populate("customerId", "name phone")
    .sort({ createdAt: -1 })
    .lean();

  for (const sale of sales) {
    const items = await SaleItem.find({ saleId: sale._id })
      .populate("itemId", "name unit type");

    sale.items = items;
  }

  return sales;
};