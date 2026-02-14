import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";

export const createOpeningBalance = async (capitalAmount, inventoryAmount = 0) => {

  if (!capitalAmount || capitalAmount <= 0) {
    throw new Error("Capital amount required");
  }

  const cashAccount = await Account.findOne({ name: "Cash" });
  const inventoryAccount = await Account.findOne({ name: "Inventory" });
  const capitalAccount = await Account.findOne({ name: "Owner Capital" });

  if (!cashAccount || !inventoryAccount || !capitalAccount) {
    throw new Error("Required accounts missing in database");
  }

  const today = new Date();

  const cashAmount = capitalAmount - inventoryAmount;

  // Inventory Entry (if provided)
  if (inventoryAmount > 0) {
    await Ledger.create({
      description: "Opening Inventory",
      debitAccount: inventoryAccount._id,
      creditAccount: capitalAccount._id,
      amount: inventoryAmount,
      date: today
    });
  }

  // Cash Entry
  await Ledger.create({
    description: "Opening Capital",
    debitAccount: cashAccount._id,
    creditAccount: capitalAccount._id,
    amount: cashAmount,
    date: today
  });

  return { message: "Opening balance created successfully" };
};
