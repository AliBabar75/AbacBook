// services/invoice.service.js
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import PartyLedger from "../models/partyLedger.model.js";

export const postInvoice = async (invoiceData) => {
  const {
    customerId,
    items,
    totalAmount,
  } = invoiceData;

  // 1️⃣ Invoice create
  const invoice = await Invoice.create({
    customerId,
    items,
    totalAmount,
    status: "POSTED",
  });

  // 2️⃣ Customer ledger entry (SALE)
  const lastLedger = await PartyLedger.findOne({
    partyId: customerId,
    partyType: "customer",
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger?.balanceAfter || 0;
  const newBalance = previousBalance + totalAmount;

  await PartyLedger.create({
    partyId: customerId,
    partyType: "customer",
    refType: "SALE",
    refId: invoice._id,
    debit: totalAmount,
    credit: 0,
    balanceAfter: newBalance,
  });

  // 3️⃣ Customer balance update
  await Customer.findByIdAndUpdate(customerId, {
    balance: newBalance,
  });

  return invoice;
};
