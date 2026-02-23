import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    finishedGood: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    inputItems: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        quantity: Number,
      },
    ],

    type: {
      type: String,
      enum: ["IN", "OUT", "CONVERSION"],
      required: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number },
    totalAmount: { type: Number },


    reference: {
  type: String,
  required: true,
},
    debitAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    creditAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
   
  },
  { timestamps: true },
);

export default mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
