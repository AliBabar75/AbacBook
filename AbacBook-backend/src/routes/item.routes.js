import express from "express";
import { createItem, getItems } from "../controllers/item.controller.js";
const router = express.Router();
import { authMiddleware } from "../middlewares/auth.middlewares.js";
router.post("/", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);

export default router;
