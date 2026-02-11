import Expense from "../modules/expense.model.js";
import PartyLedger from "../modules/partyLedger.model.js";

export const createExpense = async (data) => {

  const expense = await Expense.create(data);

  await PartyLedger.create({
    partyType: "expense",
    refType: "EXPENSE",
    refId: expense._id,
    debit: data.amount,
    credit: 0,
    balanceAfter: data.amount
  });

  return expense;
};

export const getExpenses = async () => {
  return Expense.find().sort({ createdAt: -1 });
};
