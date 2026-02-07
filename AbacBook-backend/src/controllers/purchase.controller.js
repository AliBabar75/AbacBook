import {
  createPurchaseService,
  listPurchasesService,
} from "../services/purchase.service.js";

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
