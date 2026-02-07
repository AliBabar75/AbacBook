import mongoose from "mongoose";


const ledgerSchema = new mongoose.Schema({
date: { type: Date, default: Date.now },
description: String,
debitAccount: {
type: mongoose.Schema.Types.ObjectId,
ref: "Account",
required: true,
},
creditAccount: {
type: mongoose.Schema.Types.ObjectId,
ref: "Account",
required: true,
},
amount: { type: Number, required: true },
});


export default mongoose.model("Ledger", ledgerSchema);