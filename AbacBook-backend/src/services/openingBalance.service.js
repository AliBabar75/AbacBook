import Account from "../modules/account.model.js";
import Ledger from "../modules/ledger.model.js";
import { withTransaction } from "../shared/withTransaction.js";

export const createOpeningBalance = async (capitalAmount, inventoryAmount = 0) => {
  return withTransaction(async (session) => {

    if (!capitalAmount || capitalAmount <= 0) {
      throw new Error("Capital amount required");
    }

    const cashAccount = await Account.findOne({ name: "Cash" }).session(session);
    const inventoryAccount = await Account.findOne({ name: "Inventory" }).session(session);
    const capitalAccount = await Account.findOne({ name: "Owner Capital" }).session(session);

    if (!cashAccount || !inventoryAccount || !capitalAccount) {
      throw new Error("Required accounts missing in database");
    }

    const today = new Date();

    const cashAmount = capitalAmount - inventoryAmount;

    // Inventory Entry (if provided)
    if (inventoryAmount > 0) {
      await Ledger.create(
        [{
          description: "Opening Inventory",
          debitAccount: inventoryAccount._id,
          creditAccount: capitalAccount._id,
          amount: inventoryAmount,
          date: today
        }],
        { session }
      );
    }

    // Cash Entry
    await Ledger.create(
      [{
        description: "Opening Capital",
        debitAccount: cashAccount._id,
        creditAccount: capitalAccount._id,
        amount: cashAmount,
        date: today
      }],
      { session }
    );

    return { message: "Opening balance created successfully" };
  });
};
