// import PurchaseReturn from "../modules/purchaseReturn.model.js";
// import Purchase from "../modules/purchase.model.js";
// import Supplier from "../modules/supplier.model.js";
// import { stockOut } from "../services/inventory.service.js";
// import { createLedgerEntry } from "../services/ledger.service.js";



// export const listPurchaseReturns = async (req, res) => {
//   try {
//     const returns = await PurchaseReturn.find()
//       .populate("purchaseId", "invoiceNo supplierId")
//       .populate("items.itemId", "name");

//     res.json(returns);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const createPurchaseReturn = async (req, res) => {
//   try {
//     const { purchaseId, date, items, notes } = req.body;

//     const purchase = await Purchase.findById(purchaseId);
//     if (!purchase) {
//       return res.status(404).json({ message: "Purchase not found" });
//     }

//     //  fetch supplier & account
//     const supplier = await Supplier.findById(purchase.supplierId);
//     if (!supplier || !supplier.accountId) {
//       return res.status(400).json({ message: "Supplier account not found" });
//     }

//     const supplierAccountId = supplier.accountId;

//     //  SAVE purchase return FIRST
//     const purchaseReturn = await PurchaseReturn.create({
//         returnNo: `PR-${Date.now()}`,
//       purchaseId,
//       date,
//       items,
//       notes,
//       totalAmount: items.reduce((sum, i) => sum + (i.amount || 0), 0),
//       status: "processed",
//     });

//     //  STOCK OUT (per item)
//     for (const item of items) {
//       await stockOut({
//          itemId: item.itemId,
//     quantity: item.quantity,
//         debitAccount: supplierAccountId,
//         creditAccount: inventoryAccount._id,
//         userId: req.user._id,
//       });
//     }

//     //  LEDGER ENTRY (TOTAL)
//     await createLedgerEntry({
//       date,
//       referenceType: "PURCHASE_RETURN",
//       referenceId: purchaseReturn._id,
//       debitAccount: supplierAccountId,
//       creditAccount: inventoryAccount._id,
//       amount: purchaseReturn.totalAmount,
//       partyId: purchase.supplierId,
//       narration: "Purchase return",
//     });

//     res.status(201).json(purchaseReturn);

//   } catch (err) {
//     console.error("Purchase return error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
import { createPurchaseReturnService } from "../services/purchaseReturn.service.js";
import PurchaseReturn from "../modules/purchaseReturn.model.js";

export const listPurchaseReturns = async (req, res) => {
  try {
    const returns = await PurchaseReturn.find()
      .populate("purchaseId", "invoiceNo supplierId")
      .populate("items.rawMaterialId", "name");

    res.json(returns);
  } catch (err) {
    console.error(err);
    
    res.status(500).json({ message: "Server error" });
  }
};

export const createPurchaseReturn = async (req, res) => {
  try {
    const purchaseReturn = await createPurchaseReturnService({
      ...req.body,
     userId: req.user?.id,

    });

    res.status(201).json(purchaseReturn);
  } catch (err) {
    console.error("Purchase return error:", err);
    res.status(400).json({ message: err.message });
  }
};
