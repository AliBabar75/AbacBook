import express from "express";
import {
  receivableAging,
  payableAging,
} from "../controllers/aging.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.get("/receivable", authMiddleware,receivableAging);
router.get("/payable", authMiddleware,payableAging);

export default router;
