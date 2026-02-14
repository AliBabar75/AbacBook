import express from "express";
import { getSaleInvoice } from "../controllers/invoice.controller.js";

const router = express.Router();

router.get("/:id/invoice", getSaleInvoice);

export default router;