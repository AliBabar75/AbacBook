import Supplier from "../modules/supplier.model.js";
import Account from "../modules/account.model.js";

export const createSupplierService = async (data) => {
  const openingBalance = Number(data.openingBalance) || 0;

  // ✅ Generate sequential supplier code
  const supplierCount = await Account.countDocuments({
    type: "LIABILITY",
    code: { $regex: "^SUP-" },
  });

  const code = `SUP-${1001 + supplierCount}`;

  // ✅ Create ledger account FIRST
  const account = await Account.create({
    name: data.name,
    code,
    type: "LIABILITY",
  });

  // ✅ Create supplier linked with ledger
  const supplier = await Supplier.create({
    name: data.name,
    phone: data.phone || "",
    email: data.email || "",
    openingBalance,
    balance: openingBalance,
    accountId: account._id,
  });

  return supplier;
};

export const listSuppliersService = async () => {
  return Supplier.find().sort({ createdAt: -1 });
};

