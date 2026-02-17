import express from "express";
import { createEntry, getPartyLedger } from "../controllers/ledger.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/",
    
    authMiddleware,
    createEntry);
    
    
    router.get("/party/:partyId", 
        authMiddleware,
    
    getPartyLedger);

export default router;