// // import mongoose from "mongoose";

// // const supplierSchema = new mongoose.Schema(
// //   {
// //     name: { type: String, required: true, trim: true },
// //     phone: { type: String,required: true, },
// //     email: { type: String,required: true, },
// //     address: { type: String,required: true, },
// //     balance: { type: Number, },
// //     isActive: { type: Boolean, default: true },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Supplier", supplierSchema);

// import mongoose from "mongoose";

// const supplierSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       trim: true,
//       unique: true,
//       sparse: true, // allow empty but unique if present
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       trim: true,
//     },

//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//     },

//     // 🔥 CURRENT BALANCE (AUTO UPDATED)
//     balance: {
//       type: Number,
//       default: 0,
//     },

//     // 🔥 OPENING BALANCE (REFERENCE ONLY)
//     openingBalance: {
//       type: Number,
//       default: 0,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// /* ================= AUTO CODE GENERATION ================= */
// supplierSchema.pre("save", async function (next) {
//   if (this.code) return next();

//   const count = await mongoose.model("Supplier").countDocuments();
//   this.code = `SUP-${String(count + 1).padStart(4, "0")}`;

//   next();
// });

// export default mongoose.model("Supplier", supplierSchema);

import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    openingBalance: {
      type: Number,
      default: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

supplierSchema.pre("save", async function () {
  if (this.isNew) {
    this.balance = this.openingBalance || 0;
  }
});

export default mongoose.model("Supplier", supplierSchema);
