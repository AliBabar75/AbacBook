import Purchase from "../modules/purchase.model.js";
import { stockIn } from "./inventory.service.js";
import Account from "../modules/account.model.js";
import Supplier from "../modules/supplier.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Ledger from "../modules/ledger.model.js";
import { withTransaction } from "../shared/withTransaction.js";

export const createPurchaseService = async ({
  date,
  invoiceNo,
  supplierId,
  paymentTerms,
  notes,
  items,
  userId,
}) => {
  return withTransaction(async (session) => {

    if (!items || items.length === 0) {
      throw new Error("Purchase items required");
    }

    const inventoryAccount = await Account.findOne({ name: "Inventory" }).session(session);
    const apAccount = await Account.findOne({ name: "Accounts Payable" }).session(session);

    if (!inventoryAccount || !apAccount) {
      throw new Error("Inventory or Accounts Payable account missing");
    }

    const supplier = await Supplier.findById(supplierId).session(session);
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

    const purchase = await Purchase.create(
      [{
        date,
        invoiceNo,
        supplierId,
        paymentTerms,
        notes,
        items: normalizedItems,
        totalAmount: grandTotal,
        createdBy: userId,
      }],
      { session }
    );

    // 🔹 STOCK IN
    for (const item of normalizedItems) {
      await stockIn({
        itemId: item.rawMaterialId,
        quantity: item.quantity,
        unitCost: item.rate,
        debitAccount: inventoryAccount._id,
        creditAccount: apAccount._id,
        reference: "PURCHASE",
        userId,
        session, // session pass (logic unchanged)
      });
    }

    const lastLedger = await PartyLedger.findOne({
      partyId: supplierId,
      partyType: "supplier",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance - grandTotal;

    await PartyLedger.create(
      [{
        partyId: supplierId,
        partyType: "supplier",
        refType: "PURCHASE",
        refId: purchase[0]._id,
        debit: 0,
        credit: grandTotal,
        balanceAfter: newBalance,
      }],
      { session }
    );

    return purchase[0];
  });
};



export const listPurchasesService = async ({ page = 1, limit = 20 }) => {
  const purchases = await Purchase.find()
    .populate("supplierId", "name")
    .populate("items.rawMaterialId", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return purchases.map((p) => {
    const totalAmount = p.totalAmount || 0;
    const totalReturned = p.totalReturned || 0;
    const totalPaid = p.totalPaid || 0;

    const netPurchase = totalAmount - totalReturned;
    const outstanding = netPurchase - totalPaid;

    return {
      id: p._id,
      date: p.date,
      invoiceNo: p.invoiceNo,
      supplier: p.supplierId?.name || "—",
      items: p.items.length,
      total: totalAmount,
      returned: totalReturned,
      totalPaid,
      netPurchase,
      outstanding,
      status: p.status,
    };
  });
};



export const payPurchaseService = async ({
  purchaseId,
  amount,
  paymentMethod,
  date,
}) => {
  return withTransaction(async (session) => {

    const purchase = await Purchase.findById(purchaseId).session(session);
    if (!purchase) throw new Error("Purchase not found");
    if (amount <= 0) throw new Error("Invalid payment amount");

    const apAccount = await Account.findOne({ name: "Accounts Payable" }).session(session);

    const paymentAccount =
      paymentMethod === "cash"
        ? await Account.findOne({ name: "Cash" }).session(session)
        : await Account.findOne({ name: "Bank" }).session(session);

    if (!apAccount || !paymentAccount)
      throw new Error("Required accounts missing");

    await Ledger.create(
      [{
        description: "Purchase Payment",
        date,
        debitAccount: apAccount._id,
        creditAccount: paymentAccount._id,
        amount,
      }],
      { session }
    );

    const lastLedger = await PartyLedger.findOne({
      partyId: purchase.supplierId,
      partyType: "supplier",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance + amount;

    await PartyLedger.create(
      [{
        partyId: purchase.supplierId,
        partyType: "supplier",
        refType: "PURCHASE_PAYMENT",
        refId: purchase._id,
        debit: amount,
        credit: 0,
        balanceAfter: newBalance,
      }],
      { session }
    );

    purchase.totalPaid = (purchase.totalPaid || 0) + amount;

    const netPurchase =
      purchase.totalAmount - (purchase.totalReturned || 0);

    const outstanding =
      netPurchase - purchase.totalPaid;

    if (outstanding <= 0) {
      purchase.status = "paid";
    } else if (purchase.totalPaid > 0) {
      purchase.status = "partial";
    } else {
      purchase.status = "unpaid";
    }

    await purchase.save({ session });

    return { message: "Purchase payment recorded successfully" };
  });
};



export const refundPurchasePayment = async ({
  purchaseId,
  amount,
  paymentMethod,
  date,
}) => {
  return withTransaction(async (session) => {

    const purchase = await Purchase.findById(purchaseId).session(session);
    if (!purchase) throw new Error("Purchase not found");
    if (amount <= 0) throw new Error("Invalid refund amount");

    const apAccount = await Account.findOne({ name: "Accounts Payable" }).session(session);

    const cashAccount =
      paymentMethod === "cash"
        ? await Account.findOne({ name: "Cash" }).session(session)
        : await Account.findOne({ name: "Bank" }).session(session);

    if (!apAccount || !cashAccount)
      throw new Error("Required accounts missing");

    const netPurchase =
      purchase.totalAmount - (purchase.totalReturned || 0);

    const maxRefundable =
      (purchase.totalPaid || 0) - netPurchase;

    if (amount > maxRefundable) {
      throw new Error("Refund exceeds allowable overpayment");
    }

    await Ledger.create(
      [{
        description: "Purchase Refund Received",
        date,
        debitAccount: cashAccount._id,
        creditAccount: apAccount._id,
        amount,
      }],
      { session }
    );

    const lastLedger = await PartyLedger.findOne({
      partyId: purchase.supplierId,
      partyType: "supplier",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance - amount;

    await PartyLedger.create(
      [{
        partyId: purchase.supplierId,
        partyType: "supplier",
        refType: "PURCHASE_REFUND",
        refId: purchase._id,
        debit: 0,
        credit: amount,
        balanceAfter: newBalance,
      }],
      { session }
    );

    purchase.totalPaid = (purchase.totalPaid || 0) - amount;

    const outstanding =
      netPurchase - (purchase.totalPaid || 0);

    if (outstanding <= 0) {
      purchase.status = "paid";
    } else if ((purchase.totalPaid || 0) > 0) {
      purchase.status = "partial";
    } else {
      purchase.status = "unpaid";
    }

    await purchase.save({ session });

    return { message: "Purchase refund processed successfully" };
  });
};
