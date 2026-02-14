import express from "express";
import { postExpense, listExpenses } from "../controllers/expense.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/", authMiddleware, postExpense);
router.get("/", authMiddleware, listExpenses);

export default router;
