import { consumeRecipe } from "../services/recipe.service.js";

export const produceAttar = async (req, res, next) => {
  try {
    const result = await consumeRecipe(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
