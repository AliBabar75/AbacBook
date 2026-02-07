// // import {createSupplierService,listSuppliersService,} from "../services/supplier.service.js";

// // export const createSupplier = async (req, res) => {
// //   try {
// //     const supplier = await createSupplierService(req.body);
// //     res.status(201).json({ success: true, data: supplier });
// //   } catch (err) {
// //     res.status(400).json({ success: false, message: err.message });
// //   }
// // };

// // export const listSuppliers = async (req, res) => {
// //   const suppliers = await listSuppliersService();
// //   res.json({ items: suppliers });
// // };
// import {
//   createSupplierService,
//   listSuppliersService,
// } from "../services/supplier.service.js";

// export const createSupplier = async (req, res) => {
//   try {
//     const supplier = await createSupplierService(req.body);

//     res.status(201).json({
//       success: true,
//       supplier,
//     });
//   } catch (error) {
//     console.error("CREATE SUPPLIER ERROR:", error);
//     res.status(500).json({
//       message: "Failed to create supplier",
//     });
//   }
// };

// export const listSuppliers = async (req, res) => {
//   try {
//     const suppliers = await listSuppliersService();

//     res.json({
//       success: true,
//       suppliers,
//     });
//   } catch (error) {
//     console.error("LIST SUPPLIERS ERROR:", error);
//     res.status(500).json({
//       message: "Failed to load suppliers",
//     });
//   }
// };
import {
  createSupplierService,
  listSuppliersService,
} from "../services/supplier.service.js";

export const createSupplier = async (req, res) => {
  try {
    const supplier = await createSupplierService(req.body);

    res.status(201).json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("❌ CREATE SUPPLIER ERROR:", error); // 🔥 VERY IMPORTANT
    res.status(500).json({
      message: "Failed to create supplier",
    });
  }
};

export const listSuppliers = async (req, res) => {
  try {
    const suppliers = await listSuppliersService();

    res.json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("❌ LIST SUPPLIERS ERROR:", error);
    res.status(500).json({
      message: "Failed to load suppliers",
    });
  }
};

