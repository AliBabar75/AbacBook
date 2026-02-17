import { getInventoryClosingService } from "../services/inventoryClosing.service.js";

export const getInventoryClosing = async (req, res, next) => {
  try {
    const { asOfDate, itemType } = req.query;

    const data = await getInventoryClosingService({
      asOfDate,
      itemType,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
};
