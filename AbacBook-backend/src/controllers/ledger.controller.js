import Ledger from "../modules/ledger.model.js";
import { getPartyLedgerService } from "../services/ledger.service.js";
import PartyLedger from "../modules/partyLedger.model.js";
import Purchase from "../modules/purchase.model.js";
import Sale from "../modules/sale.model.js";
export const createEntry = async (req, res, next) => {
try {
const { debitAccount, creditAccount, amount } = req.body;


if (amount <= 0) throw new Error("Invalid amount");


const entry = await Ledger.create({
...req.body,
});


res.status(201).json(entry);
} catch (err) {
next(err);
}
};

export const getPartyLedger = async (req, res) => {
  const { partyId } = req.params;
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate
    ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
    : new Date();

  const entries = await PartyLedger.find({
    partyId,
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: 1 });

  let runningBalance = 0;

  const transactions = [];

  for (const entry of entries) {
    runningBalance = entry.balanceAfter;

    let referenceName = entry.refId?.toString();

    // 🔥 PURCHASE
    if (entry.refType === "PURCHASE") {
      const purchase = await Purchase.findById(entry.refId)
        .populate("items.rawMaterialId", "name");

      if (purchase?.items?.length) {
        referenceName = purchase.items
          .map(i => i.rawMaterialId?.name)
          .join(", ");
      }
    }

    // 🔥 SALE
    // if (entry.refType === "SALE") {
    //   const sale = await Sale.findById(entry.refId)
    //     .populate("items.itemId", "name");

    //   if (sale?.items?.length) {
    //     referenceName = sale.items
    //       .map(i => i.itemId?.name)
    //       .join(", ");
    //   }
    // }

    transactions.push({
      date: entry.createdAt,
      particulars: entry.refType,
      reference: referenceName,
      debit: entry.debit,
      credit: entry.credit,
      balance: runningBalance,
    });
  }

  res.json({
    openingBalance: 0,
    transactions,
    closingBalance: runningBalance,
  });
};