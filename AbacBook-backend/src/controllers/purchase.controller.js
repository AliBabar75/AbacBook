import {
  createPurchaseService,
  listPurchasesService,
} from "../services/purchase.service.js";
import Purchase from "../modules/purchase.model.js";
export const createPurchase = async (req, res) => {
  try {
    const purchase = await createPurchaseService({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: purchase });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const listPurchases = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const data = await listPurchasesService({ page, limit });
  res.json({ items: data });
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplierId", "name")
      .populate("items.rawMaterialId", "name");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (err) {
    console.error("GET /purchases/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
};