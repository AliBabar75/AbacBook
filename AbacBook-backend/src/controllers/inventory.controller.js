import { stockIn, stockOut } from "../services/inventory.service.js";
import { listRawMaterials } from "../services/inventory.service.js";
import { consumeRecipeService } from "../services/inventory.service.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import {
  conversionService,
  listFinishedGoods,
} from "../services/inventory.service.js";

export const addStock = async (req, res) => {
  try {
    const result = await stockIn({
      ...req.body,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "Stock In successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeStock = async (req, res) => {
  try {
    const result = await stockOut({
      ...req.body,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Stock Out successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRawMaterials = async (req, res, next) => {
  try {
    const items = await listRawMaterials(req.query);
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

export const consumeRecipe = async (req, res, next) => {
  try {
    const result = await consumeRecipeService(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
};

export const getStockHistory = async (req, res) => {
  try {
    const data = await InventoryTransaction.find({
      type: { $in: ["IN", "OUT"] },
    })
      .populate("item", "name")
      .populate("createdBy", "name")
      .populate("finishedGood", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const convertInventory = async (req, res) => {
  try {
    const result = await conversionService({
      ...req.body,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "Conversion successful",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getFinishedGoods = async (req, res) => {
  const items = await listFinishedGoods();
  res.json({ items });
};

export const getConversionHistory = async (req, res) => {
  const data = await InventoryTransaction.find({ type: "CONVERSION" })
    .populate("item", "name")
    .populate("finishedGood", "name")
    .populate("inputItems.rawMaterialId", "name")
    .sort({ createdAt: -1 });
  res.json(data);
};
