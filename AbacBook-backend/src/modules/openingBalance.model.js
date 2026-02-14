import mongoose from "mongoose";

const openingBalanceSchema = new mongoose.Schema(
  {
    capitalAmount: { type: Number, required: true },
    inventoryAmount: { type: Number, default: 0 },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("OpeningBalance", openingBalanceSchema);
