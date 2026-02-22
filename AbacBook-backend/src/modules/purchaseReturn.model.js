
import mongoose from "mongoose";

const purchaseReturnItemSchema = new mongoose.Schema({
  rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number },
  amount: { type: Number },
  reason: { type: String },
});

const purchaseReturnSchema = new mongoose.Schema({
  returnNo: { type: String, unique: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  date: { type: Date, required: true },
  items: [purchaseReturnItemSchema],
  totalAmount: { type: Number },
  notes: { type: String },
  status: { type: String, default: "processed" },
  refundPaid: {
  type: Number,
  default: 0,
},
refundStatus: {
  type: String,
  enum: ["unpaid", "partial", "settled","returned"],
  default: "unpaid",
},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("PurchaseReturn", purchaseReturnSchema);
