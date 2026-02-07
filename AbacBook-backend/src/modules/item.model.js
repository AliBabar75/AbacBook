import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    
    name: { type: String, required: true },

    type: {
      type: String,
      enum: ["RAW_MATERIAL", "PRODUCT","FINISHED_GOOD"],
      required: true
    },

    unit: { type: String, required: true },

    avgCost: { type: Number, default: 0 },

    quantity: { type: Number, default: 0 },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false 
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
