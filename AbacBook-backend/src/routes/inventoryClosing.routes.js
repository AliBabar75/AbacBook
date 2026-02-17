import express from "express";
import { getInventoryClosing } from "../controllers/inventoryClosing.controller.js";

const router = express.Router();

router.get("/", getInventoryClosing);

export default router;