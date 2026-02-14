import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  total: { type: Number, required: true },
});

const purchaseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    invoiceNo: { type: String, required: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    paymentTerms: { type: String },
    notes: { type: String },
    items: [purchaseItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    totalPaid: {
  type: Number,
  default: 0,
},
totalReturned: {
  type: Number,
  default: 0,
},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
