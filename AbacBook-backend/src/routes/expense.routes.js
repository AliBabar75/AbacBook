import express from "express";
import { postExpense, listExpenses } from "../controllers/expense.controller.js";

const router = express.Router();
router.post("/", postExpense);
router.get("/", listExpenses);
export default router;
