import express from "express";
import {
  receivableAging,
  payableAging,
} from "../controllers/aging.controller.js";

const router = express.Router();

router.get("/receivable", receivableAging);
router.get("/payable", payableAging);

export default router;
