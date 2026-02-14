import Purchase from "../modules/purchase.model.js";
import { stockIn } from "./inventory.service.js";
import Account from "../modules/account.model.js";
import Supplier from "../modules/supplier.model.js";
import PartyLedger from "../modules/partyLedger.model.js";

export const createPurchaseService = async ({
  date,
  invoiceNo,
  supplierId,
  paymentTerms,
  notes,
  items,
  userId,
}) => {

  if (!items || items.length === 0) {
    throw new Error("Purchase items required");
  }

  const inventoryAccount = await Account.findOne({ name: "Inventory" });
  const apAccount = await Account.findOne({ name: "Accounts Payable" });

  if (!inventoryAccount || !apAccount) {
    throw new Error("Inventory or Accounts Payable account missing");
  }

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error("Supplier not found");

  let grandTotal = 0;

  const normalizedItems = items.map((item) => {
    const total = Number(item.quantity) * Number(item.rate);
    grandTotal += total;

    return {
      rawMaterialId: item.itemId,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      total,
    };
  });

  const purchase = await Purchase.create({
    date,
    invoiceNo,
    supplierId,
    paymentTerms,
    notes,
    items: normalizedItems,
    totalAmount: grandTotal,
    createdBy: userId,
  });

  // 🔹 STOCK IN (inventory increase)
  for (const item of normalizedItems) {
    await stockIn({
      itemId: item.rawMaterialId,
      quantity: item.quantity,
      unitCost: item.rate,
      debitAccount: inventoryAccount._id,
      creditAccount: apAccount._id,
      reference: "PURCHASE",
      userId,
    });
  }

  // 🔹 Party Ledger (Supplier Credit)
  const lastLedger = await PartyLedger.findOne({
    partyId: supplierId,
    partyType: "supplier",
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger?.balanceAfter || 0;
  const newBalance = previousBalance - grandTotal;

  await PartyLedger.create({
    partyId: supplierId,
    partyType: "supplier",
    refType: "PURCHASE",
    refId: purchase._id,
    debit: 0,
    credit: grandTotal,
    balanceAfter: newBalance,
  });

  return purchase;
};



export const listPurchasesService = async ({ page = 1, limit = 20 }) => {

  const purchases = await Purchase.find()
    .populate("supplierId", "name")
    .populate("items.rawMaterialId", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return purchases.map((p) => ({
    id: p._id,
    date: p.date,
    invoiceNo: p.invoiceNo,
    supplier: p.supplierId?.name || "—",
    items: p.items.length,
    total: p.totalAmount,
    status: p.status,
  }));
};
