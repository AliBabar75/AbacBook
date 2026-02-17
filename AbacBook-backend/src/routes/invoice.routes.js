import express from "express";
import { getSaleInvoice } from "../controllers/invoice.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.get("/:id/invoice",authMiddleware,getSaleInvoice,);

export default router;
