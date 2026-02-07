import express from "express";
import { createAccount, getAccounts } from "../controllers/account.controller.js";


const router = express.Router();
router.post("/", createAccount);
router.get("/", getAccounts);
export default router;