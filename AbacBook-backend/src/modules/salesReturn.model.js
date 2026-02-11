import mongoose from "mongoose";

const salesReturnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true,
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    notes: String,

    totalAmount: {
      type: Number,
      required: true,
    },

    totalTax: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PROCESSED"],
      default: "PROCESSED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SalesReturn", salesReturnSchema);
