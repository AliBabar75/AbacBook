import mongoose from "mongoose";
import Item from "../modules/item.model.js";
import Ledger from "../modules/ledger.model.js";
import { normalizeQty } from "./inventory.service.js";

export const consumeRecipe = async ({
  productItemId,      
  ingredients,        
  outputQty,
  inventoryAccount,
  cogsAccount
}) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    let totalCost = 0;

    for (const ing of ingredients) {
      const item = await Item.findById(ing.itemId).session(session);
      if (!item) throw new Error("Ingredient not found");

      const usedQty = normalizeQty(
        ing.quantity,
        ing.unit,
        item.unit
      );

      if (item.quantity < usedQty)
        throw new Error(`Insufficient stock: ${item.name}`);

      totalCost += usedQty * item.avgCost;

      item.quantity -= usedQty;
      await item.save();
    }

    
    const product = await Item.findById(productItemId).session(session);
    if (!product) throw new Error("Final product not found");

    const oldValue = product.quantity * product.avgCost;
    const newValue = totalCost;
    const newQty = product.quantity + outputQty;

    product.avgCost = (oldValue + newValue) / newQty;
    product.quantity = newQty;

    await product.save();

    
    await Ledger.create([{
      description: "Attar Production",
      debitAccount: inventoryAccount,
      creditAccount: cogsAccount,
      amount: totalCost
    }], { session });

    await session.commitTransaction();
    return product;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
