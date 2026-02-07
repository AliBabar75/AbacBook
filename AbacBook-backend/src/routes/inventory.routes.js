import { Router } from "express";
import {
  addStock,
  removeStock,
  getRawMaterials,
  consumeRecipe,
  getFinishedGoods,
  convertInventory,
  getConversionHistory,
} from "../controllers/inventory.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getStockHistory } from "../controllers/inventory.controller.js";
const router = Router();

router.get("/raw-materials", getRawMaterials);
router.post("/in", authMiddleware, addStock);
router.post("/out", authMiddleware, removeStock);
router.post("/consume", authMiddleware, consumeRecipe);
router.get("/history", authMiddleware, getStockHistory);
router.get("/finished-goods", authMiddleware, getFinishedGoods);
router.post("/conversion", authMiddleware, convertInventory);
router.get("/conversion/history", authMiddleware, getConversionHistory);

export default router;
