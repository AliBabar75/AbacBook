import * as AgingService from "../services/aging.service.js";

export const receivableAging = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const data = await AgingService.getReceivableAging(asOfDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const payableAging = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const data = await AgingService.getPayableAging(asOfDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
