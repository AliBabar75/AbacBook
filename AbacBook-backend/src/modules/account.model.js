import mongoose from "mongoose";


const accountSchema = new mongoose.Schema({
name: { type: String, required: true },
code: { type: String, required: true, unique: true },
type: {
type: String,
enum: ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"],
required: true,
},
createdAt: { type: Date, default: Date.now },
});


export default mongoose.model("Account", accountSchema);