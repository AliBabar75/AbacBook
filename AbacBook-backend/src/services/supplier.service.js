import Supplier from "../modules/supplier.model.js";

export const createSupplierService = async (data) => {
  const openingBalance = Number(data.openingBalance) || 0;

  const supplier = await Supplier.create({
    name: data.name,
    phone: data.phone || "",
    email: data.email || "",
    openingBalance,
    balance: openingBalance,
  });

  return supplier;
};

export const listSuppliersService = async () => {
  return Supplier.find().sort({ createdAt: -1 });
};

// export const listSuppliersService = async () => {
//   const suppliers = await Supplier.find({ isActive: true })
//     .select("_id name phone balance ")
//     .sort({ name: 1 });

//   return suppliers.map((s) => ({
//     id: s._id,
//     name: s.name,
//     phone: s.phone,
//     balance:s.balance,
//   }));
// };
