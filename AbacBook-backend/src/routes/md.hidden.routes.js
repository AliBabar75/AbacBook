import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import Purchase from "../modules/purchase.model.js";
import Sale from "../modules/sale.model.js";
import PurchaseReturn from "../modules/purchaseReturn.model.js";
import SaleReturn from "../modules/salesReturn.model.js";
import Item from "../modules/item.model.js";
import Ledger from "../modules/ledger.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import Supplier from "../modules/supplier.model.js";
import Customer from "../modules/customer.model.js";

const router = Router();

// 🔐 ONLY YOUR EMAIL ACCESS
const checkMD = (req, res, next) => {
  if (req.user.id !== "697e6bcc5d2f6de9098e8974") {
  return res.status(403).json({ message: "Access denied" });
}
  next();
};

// ==========================
// GET ALL DATA
// ==========================

router.get("/dump", authMiddleware, checkMD, async (req, res) => {
  const data = {
    purchases: await Purchase.find(),
    sales: await Sale.find(),
    purchaseReturns: await PurchaseReturn.find(),
    saleReturns: await SaleReturn.find(),
    items: await Item.find(),
    ledger: await Ledger.find(),
    partyLedger: await PartyLedger.find(),
    inventoryTransactions: await InventoryTransaction.find(),
    suppliers: await Supplier.find(),
    customers: await Customer.find(),
  };

  res.json(data);
});

// ==========================
// DELETE ANY DOCUMENT
// ==========================

router.delete("/:collection/:id", authMiddleware, checkMD, async (req, res) => {

  const { collection, id } = req.params;

  const models = {
    purchases: Purchase,
    sales: Sale,
    purchaseReturns: PurchaseReturn,
    saleReturns: SaleReturn,
    items: Item,
    ledger: Ledger,
    partyLedger: PartyLedger,
    inventoryTransactions: InventoryTransaction,
    suppliers: Supplier,
    customers: Customer,
  };

  const Model = models[collection];

  if (!Model) {
    return res.status(400).json({ message: "Invalid collection" });
  }

  await Model.findByIdAndDelete(id);

  res.json({ success: true });
});

export default router;
