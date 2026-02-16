import express from "express";
import { createEntry, getPartyLedger } from "../controllers/ledger.controller.js";

const router = express.Router();

router.post("/", createEntry);

// 👇 THIS IS REQUIRED FOR Ledger.tsx
router.get("/party/:partyId", getPartyLedger);

export default router;