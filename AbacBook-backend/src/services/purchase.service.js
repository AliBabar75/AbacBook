import Purchase from "../modules/purchase.model.js";
import { stockIn } from "../services/inventory.service.js";
import Account from "../modules/account.model.js";
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
    throw new Error("Purchase items are required");
  }
const inventoryAccount = await Account.findOne({ name: "Inventory" });
if (!inventoryAccount) {
  throw new Error("Inventory account not found");
}

// Cash account nikaalo
const cashAccount = await Account.findOne({ name: "Cash" });
if (!cashAccount) {
  throw new Error("Cash account not found");
}

  // const INVENTORY_ACCOUNT = "Inventory";
  // const CASH_ACCOUNT = "Cash";

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

  // ✅ INVENTORY ENTRY
  for (const item of normalizedItems) {
     console.log("STOCK IN CALL DATA 👉", {
    itemId: item.rawMaterialId,
    quantity: item.quantity,
    unitCost: item.rate,
  });
 await stockIn({
  itemId: item.rawMaterialId,        // correct key
  quantity: item.quantity,
  unitCost: item.rate,
  debitAccount: inventoryAccount._id, // ObjectId from DB
  creditAccount: cashAccount._id,     // ObjectId from DB
  userId,
});
    // await stockIn({
    //   // itemId: item.rawMaterialId,
    //   rawMaterialId: item.rawMaterialId,
    //   item: item._id,
    //   quantity: item.quantity,
    //   unitCost: item.rate,
    //   // debitAccount: INVENTORY_ACCOUNT,
    //   // creditAccount: CASH_ACCOUNT,
    //  debitAccount,
    // creditAccount,
    //   userId,
    // });
  }

  return purchase;
};


export const listPurchasesService = async ({ page = 1, limit = 20 }) => {
  const purchases = await Purchase.find()
    .populate("supplierId", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return purchases.map((p) => ({
    id: p._id,
    date: p.date,
    invoiceNo: p.invoiceNo,
    supplier: p.supplierId?.name || "",
    items: p.items.length,
    total: p.totalAmount,
    status: p.status,
  }));
};
