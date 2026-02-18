import SalesReturn from "../modules/salesReturn.model.js";
import SalesReturnItem from "../modules/salesReturnItem.model.js";
import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Item from "../modules/item.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";
import { withTransaction } from "../shared/withTransaction.js";

export const createSalesReturn = async (data) => {
  return withTransaction(async (session) => {

    const { saleId, date, items, notes } = data;

    if (!items || items.length === 0) {
      throw new Error("Return items required");
    }

    const sale = await Sale.findById(saleId).session(session);
    if (!sale) throw new Error("Sale not found");

    const revenueAccount = await Account.findOne({ name: "Sale Revenue" }).session(session);
    const arAccount = await Account.findOne({ name: "Accounts Receivable" }).session(session);
    const cogsAccount = await Account.findOne({ name: "Cost of Goods Sold" }).session(session);
    const inventoryAccount = await Account.findOne({ name: "Inventory" }).session(session);

    let totalAmount = 0;
    let totalCOGS = 0;

    const salesReturn = await SalesReturn.create(
      [{
        returnNo: `SR-${Date.now()}`,
        saleId,
        customerId: sale.customerId,
        date,
        notes,
        totalAmount: 0,
        totalTax: 0,
      }],
      { session }
    );

    for (const row of items) {
      const item = await Item.findById(row.itemId).session(session);
      const saleItem = await SaleItem.findOne({ saleId, itemId: row.itemId }).session(session);

      const amount = row.quantity * saleItem.rate;
      const cogs = row.quantity * item.avgCost;

      totalAmount += amount;
      totalCOGS += cogs;

      await SalesReturnItem.create(
        [{
          salesReturnId: salesReturn[0]._id,
          itemId: row.itemId,
          quantity: row.quantity,
          rate: saleItem.rate,
          amount,
          cogs,
        }],
        { session }
      );

      item.quantity += row.quantity;
      await item.save({ session });

      await InventoryTransaction.create(
        [{
          item: item._id,
          type: "IN",
          quantity: row.quantity,
          unitCost: item.avgCost,
          totalAmount: cogs,
          reference: "SALES_RETURN",
        }],
        { session }
      );
    }

    salesReturn[0].totalAmount = totalAmount;
    await salesReturn[0].save({ session });

    // CUSTOMER LEDGER REVERSE (CREDIT)
    const lastLedger = await PartyLedger.findOne({
      partyId: sale.customerId,
      partyType: "customer",
    }).sort({ createdAt: -1 }).session(session);

    const previousBalance = lastLedger?.balanceAfter || 0;
    const newBalance = previousBalance - totalAmount;

    await PartyLedger.create(
      [{
        partyId: sale.customerId,
        partyType: "customer",
        refType: "SALES_RETURN",
        refId: salesReturn[0]._id,
        debit: 0,
        credit: totalAmount,
        balanceAfter: newBalance,
      }],
      { session }
    );

    // Revenue Reverse
    await Ledger.create(
      [{
        description: "Sales Return - Revenue Reverse",
        date,
        debitAccount: revenueAccount._id,
        creditAccount: arAccount._id,
        amount: totalAmount,
      }],
      { session }
    );

    // COGS Reverse
    await Ledger.create(
      [{
        description: "Sales Return - COGS Reverse",
        date,
        debitAccount: inventoryAccount._id,
        creditAccount: cogsAccount._id,
        amount: totalCOGS,
      }],
      { session }
    );

    // UPDATE SALE AFTER RETURN
    sale.totalReturned = (sale.totalReturned || 0) + totalAmount;

    const netAmount =
      sale.totalAmount - (sale.totalReturned || 0);

    const outstanding =
      netAmount - (sale.totalPaid || 0);

    if (outstanding <= 0) {
      sale.status = "PAID";
    } else if (sale.totalPaid > 0) {
      sale.status = "PARTIAL";
    } else {
      sale.status = "UNPAID";
    }

    await sale.save({ session });

    return salesReturn[0];
  });
};



export const listSalesReturns = async () => {
  const returns = await SalesReturn.find()
    .populate("saleId", "invoiceNo totalAmount totalPaid totalReturned")
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
