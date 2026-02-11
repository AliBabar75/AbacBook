import Ledger from "../modules/ledger.model.js";

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
