
import Customer from "../modules/customer.model.js";
import PartyLedger from "../modules/partyLedger.model.js";

export const createCustomer = async (data) => {
  const customer = await Customer.create(data);

  // opening balance ledger entry
  if (data.openingBalance && data.openingBalance !== 0) {
    await PartyLedger.create({
      partyId: customer._id,
      partyType: "customer",
      refType: "OPENING",
      debit: data.openingBalance > 0 ? data.openingBalance : 0,
      credit: data.openingBalance < 0 ? Math.abs(data.openingBalance) : 0,
      balanceAfter: data.openingBalance,
    });

    customer.balance = data.openingBalance;
    await customer.save();
  }

  return customer;
};

export const listCustomers = async () => {
  const customers = await Customer.find({ isActive: true }).lean();

  return customers.map((c) => ({
    id: c._id,        // 🔥 frontend FIX
    code: c.code,
    name: c.name,
    email: c.email,
    phone: c.phone,
    balance: c.balance || 0,
  }));
};
