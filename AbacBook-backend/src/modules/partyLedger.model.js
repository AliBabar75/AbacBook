// models/partyLedger.model.js
import mongoose from "mongoose";

const partyLedgerSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    partyType: {
      type: String,
      enum: ["customer", "supplier"],
      required: true,
    },

    refType: {
      type: String, // SALE, PAYMENT, OPENING
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },

    balanceAfter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PartyLedger", partyLedgerSchema);
