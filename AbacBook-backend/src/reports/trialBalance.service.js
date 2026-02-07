import Ledger from "../modules/ledger.model.js";
import Account from "../modules/account.model.js";


export const generateTrialBalance = async () => {
  const accounts = await Account.find();
  const ledgers = await Ledger.find();

  const report = [];

  for (const acc of accounts) {
    let debit = 0;
    let credit = 0;

    for (const l of ledgers) {
      if (l.debitAccount.toString() === acc._id.toString()) {
        debit += l.amount;
      }
      if (l.creditAccount.toString() === acc._id.toString()) {
        credit += l.amount;
      }
    }

    if (debit !== 0 || credit !== 0) {
      report.push({
        account: acc.name,
        debit,
        credit
      });
    }
  }

  return report;
};
