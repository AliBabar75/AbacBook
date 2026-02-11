import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  date: Date,
  category: String,
  description: String,
  amount: Number,
  paidTo: String,
  paymentMethod: String,
  reference: String,
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
