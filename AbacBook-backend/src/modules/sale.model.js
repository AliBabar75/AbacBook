import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    notes: String,

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
