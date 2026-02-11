// import Purchase from "../modules/purchase.model.js";
// import PurchaseReturn from "../modules/purchaseReturn.model.js";
// import Account from "../modules/account.model.js";
// import { stockOut } from "./inventory.service.js";

// export const createPurchaseReturnService = async ({
//   purchaseId,
//   date,
//   items,
//   notes,
//   userId,
// }) => {

//   const purchase = await Purchase.findById(purchaseId);

//   if (!purchase) {
//     throw new Error("Purchase not found");
//   }

//   const inventoryAccount = await Account.findOne({ name: "Inventory" });
//   const cashAccount = await Account.findOne({ name: "Cash" });

//   if (!inventoryAccount || !cashAccount) {
//     throw new Error("Required accounts missing");
//   }

//   let totalAmount = 0;

//   const normalizedItems = [];

//   for (const row of items) {

//     const purchaseItem = purchase.items.find(
//       i => i.rawMaterialId.toString() === row.itemId
//     );

//     if (!purchaseItem) {
//       throw new Error("Item not part of purchase");
//     }

//     if (row.quantity > purchaseItem.quantity) {
//       throw new Error("Return qty exceeds purchase qty");
//     }

//     const amount = row.quantity * purchaseItem.rate;

//     totalAmount += amount;

//     normalizedItems.push({
//       rawMaterialId: row.itemId,
//       quantity: row.quantity,
//       rate: purchaseItem.rate,
//       amount,
//       reason: row.reason,
//     });

//     // 🔥 MOST IMPORTANT
//     await stockOut({
//       itemId: row.itemId,
//       quantity: row.quantity,
//       debitAccount: cashAccount._id, // reverse
//       creditAccount: inventoryAccount._id,
//       reference: "PURCHASE_RETURN",
//       userId,
//     });
//   }

//   const returnDoc = await PurchaseReturn.create({
//     returnNo: `PR-${Date.now()}`,
//     purchaseId,
//     supplierId: purchase.supplierId,
//     date,
//     items: normalizedItems,
//     totalAmount,
//     notes,
//     createdBy: userId,
//   });

//   return returnDoc;
// };
import Purchase from "../modules/purchase.model.js";
import PurchaseReturn from "../modules/purchaseReturn.model.js";
import Account from "../modules/account.model.js";
import Supplier from "../modules/supplier.model.js";
import { stockOut } from "./inventory.service.js";
import { createLedgerEntry } from "./ledger.service.js";


export const createPurchaseReturnService = async ({
  purchaseId,
  date,
  items,
  notes,
  userId,
}) => {

  const purchase = await Purchase.findById(purchaseId);

  if (!purchase) {
    throw new Error("Purchase not found");
  }

const supplier = await Supplier.findById(purchase.supplierId);
  if (!supplier || !supplier.accountId) {
    throw new Error("Supplier account missing");
  }

  const inventoryAccount = await Account.findOne({ name: "Inventory" });
  const cashAccount = await Account.findOne({ name: "Cash" });

  if (!inventoryAccount || !cashAccount) {
    throw new Error("Required accounts missing (Inventory / Cash)");
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
console.log("Inventory Account:", inventoryAccount);
console.log("Cash Account:", cashAccount);
console.log("STOCK OUT DATA:", {
  itemId: row.itemId,
  quantity: row.quantity,
  debitAccount: cashAccount._id,
  creditAccount: inventoryAccount._id,
    createdBy: userId || null,
});
// console.log(raw.itemId);
// console.log(reference);
    // 🔥 STOCK MINUS (MOST IMPORTANT FIX)
    await stockOut({
    //   rawMaterialId: row.itemId,
      itemId: row.itemId, 
      quantity: row.quantity,
    //   debitAccount:  supplier.accountId,
    debitAccount: cashAccount._id,  
      creditAccount: inventoryAccount._id,
      reference: "PURCHASE_RETURN",
       userId: userId || null,
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

  // 🔥 LEDGER ENTRY (TOTAL)
  await createLedgerEntry({
    date,
    referenceType: "PURCHASE_RETURN",
    referenceId: returnDoc._id,
    debitAccount: cashAccount._id,
    creditAccount: inventoryAccount._id,
    amount: totalAmount,
    partyId: purchase.supplierId,
    narration: "Purchase return",
  });

  return returnDoc;
};
