// routes/customer.routes.js
import express from "express";
import {
  createCustomer,
  getCustomers,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);

export default router;
