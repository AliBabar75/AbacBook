    import mongoose from "mongoose";

const salesReturnItemSchema = new mongoose.Schema({
  salesReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesReturn",
    required: true,
  },

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  quantity: Number,
  rate: Number,
  amount: Number,
  tax: Number,
  cogs: Number,
  reason: String,
});

export default mongoose.model("SalesReturnItem", salesReturnItemSchema);
