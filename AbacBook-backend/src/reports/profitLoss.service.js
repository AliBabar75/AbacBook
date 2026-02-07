import Ledger from "../modules/ledger.model.js";
import Account from "../modules/account.model.js";


export const generateProfitLoss = async () => {
  const accounts = await Account.find();
  const ledgers = await Ledger.find();

  let totalIncome = 0;
  let totalExpense = 0;

  for (const acc of accounts) {
    let balance = 0;

    for (const l of ledgers) {
      if (l.debitAccount.toString() === acc._id.toString()) {
        balance += l.amount;
      }
      if (l.creditAccount.toString() === acc._id.toString()) {
        balance -= l.amount;
      }
    }

    if (acc.type === "INCOME") {
      totalIncome += -balance;
    }

    if (acc.type === "EXPENSE") {
      totalExpense += balance;
    }
  }

  return {
    income: totalIncome,
    expense: totalExpense,
    profit: totalIncome - totalExpense
  };
};
