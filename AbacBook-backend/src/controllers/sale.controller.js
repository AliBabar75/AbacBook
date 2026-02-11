import { createSale } from "../services/sale.service.js";
import { getSales } from "../services/sale.service.js";
export const postSale = async (req, res) => {
  try {
    const sale = await createSale(req.body);
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const listSales = async (req, res) => {
  try {
    const sales = await getSales();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};