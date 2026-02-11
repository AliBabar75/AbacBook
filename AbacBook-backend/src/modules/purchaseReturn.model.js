// import mongoose from "mongoose";

// const purchaseReturnItemSchema = new mongoose.Schema({
//   itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
//   quantity: { type: Number, required: true },
//   reason: { type: String },
//   amount: { type: Number },
// });

// const purchaseReturnSchema = new mongoose.Schema({
//   purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
//   date: { type: Date, required: true },
//   items: [purchaseReturnItemSchema],
//   notes: { type: String },
//   totalAmount: { type: Number },
//   status: { type: String, default: "pending" },
// }, { timestamps: true });

// export default mongoose.model("PurchaseReturn", purchaseReturnSchema);
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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("PurchaseReturn", purchaseReturnSchema);
