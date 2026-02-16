import Ledger from "../modules/ledger.model.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Sale from "../modules/sale.model.js";
import Purchase from "../modules/purchase.model.js";

export const createLedgerEntry = async ({
  date,
  referenceType,
  referenceId,
  debitAccount,
  creditAccount,
  amount,
  partyId,
  narration,
}) => {

  return await Ledger.create({
    date,
    referenceType,
    referenceId,
    debitAccount,
    creditAccount,
    amount,
    partyId,
    narration,
  });
};

export const getPartyLedgerService = async ({
  partyId,
  startDate,
  endDate,
}) => {
  const filter = { partyId };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const entries = await PartyLedger.find(filter)
    .sort({ createdAt: 1 })
    .lean();

  let runningBalance = 0;

  const transactions = [];

  for (const entry of entries) {
    let referenceName = entry.refId;

    // 🔹 SALE & SALE_PAYMENT
    if (entry.refType === "SALE" || entry.refType === "SALE_PAYMENT") {
      const sale = await Sale.findById(entry.refId).lean();
      if (sale) {
        referenceName = sale.invoiceNo;
      }
    }

    // 🔹 PURCHASE & PURCHASE_PAYMENT & PURCHASE_RETURN
    if (
      entry.refType === "PURCHASE" ||
      entry.refType === "PURCHASE_PAYMENT" ||
      entry.refType === "PURCHASE_RETURN"
    ) {
      const purchase = await Purchase.findById(entry.refId).lean();
      if (purchase) {
        referenceName = purchase.invoiceNo;
      }
    }

    runningBalance = entry.balanceAfter;

    transactions.push({
      date: entry.createdAt,
      particulars: entry.refType,
      reference: referenceName || "-",
      debit: entry.debit || 0,
      credit: entry.credit || 0,
      balance: entry.balanceAfter,
    });
  }

  const openingBalance =
    entries.length > 0
      ? entries[0].balanceAfter -
        (entries[0].debit - entries[0].credit)
      : 0;

  const closingBalance =
    entries.length > 0
      ? entries[entries.length - 1].balanceAfter
      : 0;

  return {
    openingBalance,
    transactions,
    closingBalance,
  };
};