import {
  createSalesReturn,
  listSalesReturns,
} from "../services/salesReturn.service.js";

export const postSalesReturn = async (req, res) => {
  try {
    const result = await createSalesReturn(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getSalesReturns = async (req, res) => {
  try {
    const data = await listSalesReturns();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
