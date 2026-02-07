import Ledger from "../modules/ledger.model.js";
import Account from "../modules/account.model.js";


export const generateBalanceSheet = async () => {
  const accounts = await Account.find();
  const ledgers = await Ledger.find();

  let assets = 0;
  let liabilities = 0;
  let equity = 0;

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

    if (acc.type === "ASSET") assets += balance;
    if (acc.type === "LIABILITY") liabilities += -balance;
    if (acc.type === "EQUITY") equity += -balance;
  }

  return {
    assets,
    liabilities,
    equity
  };
};
