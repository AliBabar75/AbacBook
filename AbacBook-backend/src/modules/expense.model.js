import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  paidTo: String,
  paymentMethod: { type: String, required: true },
  reference: String
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
