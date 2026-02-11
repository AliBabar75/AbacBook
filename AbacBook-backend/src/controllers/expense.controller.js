import { createExpense, getExpenses } from "../services/expense.service.js";

export const postExpense = async (req, res) => {
  try {
    const data = await createExpense(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listExpenses = async (req, res) => {
  const data = await getExpenses();
  res.json(data);
};