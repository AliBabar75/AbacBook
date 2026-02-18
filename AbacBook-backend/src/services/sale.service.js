import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";
import { withTransaction } from "../shared/withTransaction.js";

export const createSale = async (data) => {
  return withTransaction(async (session) => {

    const { date, invoiceNo, customerId, items, notes } = data;

    if (!items || items.length === 0) {
      throw new Error("Sale items required");
    }

    const revenueAccount = await Account.findOne({ name: "Sale Revenue" }).session(session);
    const arAccount = await Account.findOne({ name: "Accounts Receivable" }).session(session);
    const cogsAccount = await Account.findOne({ name: "Cost of Goods Sold" }).session(session);
    const inventoryAccount = await Account.findOne({ name: "Inventory" }).session(session);

    if (!revenueAccount || !arAccount || !cogsAccount || !inventoryAccount) {
      throw new Error("Required accounts missing");
    }

    let totalAmount = 0;
    let totalCOGS = 0;

    for (const row of items) {
      const item = await Item.findById(row.itemId).session(session);
      if (!item) throw new Error("Item not found");

      if (item.quantity < row.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }

      totalAmount += row.quantity * row.rate;
    }

    const sale = await Sale.create(
      [{
        date,
        invoiceNo,
        customerId,
        notes,
        totalAmount,
        status: "UNPAID",
      }],
      { session }
    );

    for (const row of items) {
      const item = await Item.findById(row.itemId).session(session);

      const amount = row.quantity * row.rate;
      const cogs = row.quantity * item.avgCost;
      totalCOGS += cogs;

      await SaleItem.create(
        [{
          saleId: sale[0]._id,
          itemId: item._id,
          quantity: row.quantity,
          rate: row.rate,
          amount,
          cogs,
        }],
        { session }
      );

      item.quantity -= row.quantity;
      await item.save({ session });

      await InventoryTransaction.create(
        [{
          item: item._id,
          type: "OUT",
          quantity: row.quantity,
          unitCost: item.avgCost,
          totalAmount: cogs,
          reference: "SALE",
        }],
        { session }
      );
    }

    // Revenue Entry
    await Ledger.create(
      [{
        description: "Sale Revenue",
        date,
        debitAccount: arAccount._id,
        creditAccount: revenueAccount._id,
        amount: totalAmount,
      }],
      { session }
    );

    // COGS Entry
    await Ledger.create(
      [{
        description: "Cost of Goods Sold",
        date,
        debitAccount: cogsAccount._id,
        creditAccount: inventoryAccount._id,
        amount: totalCOGS,
      }],
      { session }
    );

    // Party Ledger
    const lastLedger = await PartyLedger.findOne({
      partyId: customerId,
      partyType: "customer",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance + totalAmount;

    await PartyLedger.create(
      [{
        partyId: customerId,
        partyType: "customer",
        refType: "SALE",
        refId: sale[0]._id,
        debit: totalAmount,
        credit: 0,
        balanceAfter: newBalance,
      }],
      { session }
    );

    return sale[0];
  });
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

export const receiveSalePayment = async ({
  saleId,
  amount,
  paymentMethod,
  date,
}) => {
  return withTransaction(async (session) => {

    if (!saleId || !amount)
      throw new Error("Sale ID and amount required");

    if (amount <= 0)
      throw new Error("Invalid payment amount");

    const sale = await Sale.findById(saleId).session(session);
    if (!sale) throw new Error("Sale not found");

    const remaining = sale.totalAmount - (sale.totalPaid || 0);

    if (amount > remaining)
      throw new Error("Payment exceeds remaining balance");

    // ===============================
    // ACCOUNTS
    // ===============================

    const arAccount = await Account.findOne({ name: "Accounts Receivable" }).session(session);
    if (!arAccount) throw new Error("Accounts Receivable missing");

    let cashAccount;

    if (paymentMethod === "cash") {
      cashAccount = await Account.findOne({ name: "Cash" }).session(session);
    } else if (
      paymentMethod === "bank" ||
      paymentMethod === "card" ||
      paymentMethod === "cheque"
    ) {
      cashAccount = await Account.findOne({ name: "Bank" }).session(session);
    }

    if (!cashAccount)
      throw new Error("Cash/Bank account missing");

    // ===============================
    // LEDGER ENTRY
    // ===============================

    await Ledger.create(
      [{
        description: "Sale Payment Received",
        date,
        debitAccount: cashAccount._id,
        creditAccount: arAccount._id,
        amount,
      }],
      { session }
    );

    // ===============================
    // PARTY LEDGER
    // ===============================

    const lastLedger = await PartyLedger.findOne({
      partyId: sale.customerId,
      partyType: "customer",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance - amount;

    await PartyLedger.create(
      [{
        partyId: sale.customerId,
        partyType: "customer",
        refType: "SALE_PAYMENT",
        refId: sale._id,
        debit: 0,
        credit: amount,
        balanceAfter: newBalance,
      }],
      { session }
    );

    // ===============================
    // UPDATE SALE STATUS
    // ===============================

    sale.totalPaid = (sale.totalPaid || 0) + amount;

    if (sale.totalPaid === sale.totalAmount) {
      sale.status = "PAID";
    } else {
      sale.status = "PARTIAL";
    }

    await sale.save({ session });

    return {
      success: true,
      message: "Payment received successfully",
    };
  });
};


export const refundSalePayment = async ({
  saleId,
  amount,
  paymentMethod,
  date,
}) => {
  return withTransaction(async (session) => {

    const sale = await Sale.findById(saleId).session(session);

    if (!sale) throw new Error("Sale not found");

    if (amount <= 0) throw new Error("Invalid refund amount");

    const arAccount = await Account.findOne({ name: "Accounts Receivable" }).session(session);

    const cashAccount =
      paymentMethod === "cash"
        ? await Account.findOne({ name: "Cash" }).session(session)
        : await Account.findOne({ name: "Bank" }).session(session);

    if (!arAccount || !cashAccount)
      throw new Error("Required accounts missing");

    // 🔹 Ledger Entry (Refund)
    await Ledger.create(
      [{
        description: "Sales Refund",
        date,
        debitAccount: arAccount._id,
        creditAccount: cashAccount._id,
        amount,
      }],
      { session }
    );

    // 🔹 Party Ledger Update
    const lastLedger = await PartyLedger.findOne({
      partyId: sale.customerId,
      partyType: "customer",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance + amount;

    await PartyLedger.create(
      [{
        partyId: sale.customerId,
        partyType: "customer",
        refType: "SALE_REFUND",
        refId: sale._id,
        debit: amount,
        credit: 0,
        balanceAfter: newBalance,
      }],
      { session }
    );

    // 🔹 Update Sale Paid
    if (amount > (sale.totalPaid || 0)) {
  throw new Error("Refund exceeds paid amount");
}
    sale.totalPaid = (sale.totalPaid || 0) - amount;

    const netSale =
      sale.totalAmount - (sale.totalReturned || 0);

    const outstanding =
      netSale - (sale.totalPaid || 0);

    if (outstanding <= 0) {
      sale.status = "PAID";
    } else if ((sale.totalPaid || 0) > 0) {
      sale.status = "PARTIAL";
    } else {
      sale.status = "UNPAID";
    }

    await sale.save({ session });

    return { message: "Refund successful" };
  });
};
