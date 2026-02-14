import { createExpense, getExpenses } from "../services/expense.service.js";

export const postExpense = async (req, res, next) => {
  try {
    const expense = await createExpense(req.body);
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

export const listExpenses = async (req, res, next) => {
  try {
    const expenses = await getExpenses();
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};
