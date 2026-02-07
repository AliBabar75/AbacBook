import express from "express";
import { createEntry } from "../controllers/ledger.controller.js";


const router = express.Router();
router.post("/", createEntry);
export default router;