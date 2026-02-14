import express from "express";
import { setupOpeningBalance } from "../controllers/openingBalance.controller.js";

const router = express.Router();

router.post("/", setupOpeningBalance);

export default router;
