import { createOpeningBalance } from "../services/openingBalance.service.js";

export const setupOpeningBalance = async (req, res, next) => {
  try {

    const { capitalAmount, inventoryAmount } = req.body;

    const result = await createOpeningBalance(
      Number(capitalAmount),
      Number(inventoryAmount || 0)
    );

    res.status(201).json({
      success: true,
      message: "Opening balance created successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
