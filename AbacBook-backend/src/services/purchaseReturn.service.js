import Purchase from "../modules/purchase.model.js";
import PurchaseReturn from "../modules/purchaseReturn.model.js";
import Account from "../modules/account.model.js";
import Supplier from "../modules/supplier.model.js";
import { stockOut } from "./inventory.service.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Ledger from "../modules/ledger.model.js";
export const createPurchaseReturnService = async ({
  purchaseId,
  date,
  items,
  notes,
  userId,
}) => {

  const purchase = await Purchase.findById(purchaseId);
  if (!purchase) throw new Error("Purchase not found");

  const inventoryAccount = await Account.findOne({ name: "Inventory" });
  const apAccount = await Account.findOne({ name: "Accounts Payable" });

  if (!inventoryAccount || !apAccount) {
    throw new Error("Required accounts missing");
  }

  let totalAmount = 0;
  const normalizedItems = [];

  for (const row of items) {

    const purchaseItem = purchase.items.find(
      i => i.rawMaterialId.toString() === row.itemId
    );

    if (!purchaseItem) {
      throw new Error("Item not part of purchase");
    }

    if (row.quantity > purchaseItem.quantity) {
      throw new Error("Return qty exceeds purchase qty");
    }

    const amount = row.quantity * purchaseItem.rate;
    totalAmount += amount;

    normalizedItems.push({
      rawMaterialId: row.itemId,
      quantity: row.quantity,
      rate: purchaseItem.rate,
      amount,
      reason: row.reason,
    });
  }

  // ✅ VALIDATION ADDED HERE (Before stock movement & create)
  const totalReturnedSoFar = purchase.totalReturned || 0;

  if (totalReturnedSoFar + totalAmount > purchase.totalAmount) {
    throw new Error("Return exceeds purchase total");
  }

  // 🔹 STOCK OUT (reduce inventory)
  for (const item of normalizedItems) {
    await stockOut({
      itemId: item.rawMaterialId,
      quantity: item.quantity,
      debitAccount: apAccount._id,
      creditAccount: inventoryAccount._id,
      userId,
    });
  }

  const returnDoc = await PurchaseReturn.create({
    returnNo: `PR-${Date.now()}`,
    purchaseId,
    supplierId: purchase.supplierId,
    date,
    items: normalizedItems,
    totalAmount,
    notes,
    status: "processed",
    createdBy: userId,
  });

  // 🔹 Party Ledger Reverse
  const lastLedger = await PartyLedger.findOne({
    partyId: purchase.supplierId,
    partyType: "supplier",
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger?.balanceAfter || 0;
  const newBalance = previousBalance + totalAmount;

  await PartyLedger.create({
    partyId: purchase.supplierId,
    partyType: "supplier",
    refType: "PURCHASE_RETURN",
    refId: returnDoc._id,
    debit: totalAmount,
    credit: 0,
    balanceAfter: newBalance,
  });

  // 🔹 Update Purchase
  purchase.totalReturned =
    (purchase.totalReturned || 0) + totalAmount;

  const netPurchase =
    purchase.totalAmount - purchase.totalReturned;

  const outstanding =
    netPurchase - (purchase.totalPaid || 0);

  if (outstanding <= 0) {
    purchase.status = "paid";
  } else if ((purchase.totalPaid || 0) > 0) {
    purchase.status = "partial";
  } else {
    purchase.status = "unpaid";
  }

  await purchase.save();

  return returnDoc;
};


export const refundPurchaseReturnService = async ({
  returnId,
  amount,
  paymentMethod,
  date,
}) => {

  const returnDoc = await PurchaseReturn.findById(returnId);
  if (!returnDoc) throw new Error("Purchase return not found");

  if (amount <= 0) throw new Error("Invalid refund amount");

  const remaining =
    returnDoc.totalAmount - (returnDoc.refundPaid || 0);

  if (amount > remaining) {
    throw new Error("Refund exceeds remaining return amount");
  }

  const apAccount = await Account.findOne({ name: "Accounts Payable" });

  const cashAccount =
    paymentMethod === "cash"
      ? await Account.findOne({ name: "Cash" })
      : await Account.findOne({ name: "Bank" });

  if (!apAccount || !cashAccount)
    throw new Error("Required accounts missing");

  // Ledger Entry
  await Ledger.create({
    description: "Purchase Return Refund Received",
    date,
    debitAccount: cashAccount._id,
    creditAccount: apAccount._id,
    amount,
  });

  // Party Ledger
  const lastLedger = await PartyLedger.findOne({
    partyId: returnDoc.supplierId,
    partyType: "supplier",
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger?.balanceAfter || 0;
  const newBalance = previousBalance - amount;

  await PartyLedger.create({
    partyId: returnDoc.supplierId,
    partyType: "supplier",
    refType: "PURCHASE_RETURN_REFUND",
    refId: returnDoc._id,
    debit: 0,
    credit: amount,
    balanceAfter: newBalance,
  });

  // Update Return
  returnDoc.refundPaid =
    (returnDoc.refundPaid || 0) + amount;

  const newRemaining =
    returnDoc.totalAmount - returnDoc.refundPaid;

  if (newRemaining === 0) {
    returnDoc.refundStatus = "settled";
  } else {
    returnDoc.refundStatus = "partial";
  }

  await returnDoc.save();

  return { message: "Return refund recorded successfully" };
};