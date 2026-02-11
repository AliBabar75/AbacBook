import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    rate: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    cogs: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SaleItem", saleItemSchema);
