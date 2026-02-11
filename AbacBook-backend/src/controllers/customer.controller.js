// controllers/customer.controller.js
import * as customerService from "../services/customer.service.js";

export const createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const data = await customerService.listCustomers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
