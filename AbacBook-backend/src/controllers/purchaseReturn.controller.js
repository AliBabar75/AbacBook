import { createPurchaseReturnService } from "../services/purchaseReturn.service.js";
import PurchaseReturn from "../modules/purchaseReturn.model.js";
import { refundPurchaseReturnService } from "../services/purchaseReturn.service.js";
// export const listPurchaseReturns = async (req, res) => {
//   try {
//     const returns = await PurchaseReturn.find()
//       .populate("purchaseId", "invoiceNo supplierId")
//       .populate("items.rawMaterialId", "name");

//     res.json(returns);
//   } catch (err) {
//     console.error(err);
    
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const listPurchaseReturns = async (req, res) => {
  try {
    const returns = await PurchaseReturn.find()
      .populate({
        path: "purchaseId",
        select: "invoiceNo supplierId",
        populate: {
          path: "supplierId",
          select: "name",
        },
      })
      .populate("supplierId", "name")
      .populate("items.rawMaterialId", "name");

    res.json(returns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createPurchaseReturn = async (req, res) => {
  try {
    const purchaseReturn = await createPurchaseReturnService({
      ...req.body,
     userId: req.user?.id,

    });

    res.status(201).json(purchaseReturn);
  } catch (err) {
    console.error("Purchase return error:", err);
    res.status(400).json({ message: err.message });
  }
};
export const refundPurchaseReturn = async (req, res) => {
  try {
    const data = await refundPurchaseReturnService(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};