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
  index: true,
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
    totalPaid: {
  type: Number,
  default: 0,
},
totalReturned: {
  type: Number,
  default: 0,
},

    status: {
      type: String,
     enum: ["UNPAID", "PARTIAL", "PAID", "RETURNED"],
      default: "UNPAID",
    },
    
  },
  { timestamps: true }
  
);
saleSchema.index({ customerId: 1, date: 1 });
saleSchema.index({ date: 1 });

export default mongoose.model("Sale", saleSchema);
