// routes/customer.routes.js
import express from "express";
import {
  createCustomer,
  getCustomers,
} from "../controllers/customer.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/", authMiddleware, createCustomer);
router.get("/",  authMiddleware,getCustomers);

export default router;
