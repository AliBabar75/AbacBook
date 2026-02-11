import mongoose from "mongoose";
import Item from "../modules/item.model.js";
import Ledger from "../modules/ledger.model.js";
import InventoryTransaction from "../modules/inventoryTransaction.model.js";

export const stockIn = async ({
  itemId,
  quantity,
  unitCost,
  debitAccount,
  creditAccount,
  reference = "STOCK IN",
  refId = null,
  userId,
}) => {
  if (
    !itemId ||
    quantity == null ||
    unitCost == null ||
    !debitAccount ||
    !creditAccount
  ) {
    throw new Error("Missing required fields");
  }

  if (
    !mongoose.Types.ObjectId.isValid(itemId) ||
    !mongoose.Types.ObjectId.isValid(debitAccount) ||
    !mongoose.Types.ObjectId.isValid(creditAccount)
  ) {
    throw new Error("Invalid ID provided");
  }

  if (quantity <= 0 || unitCost <= 0) {
    throw new Error("Quantity & unit cost must be greater than zero");
  }

  const item = await Item.findById(itemId);
  if (!item) throw new Error("Item not found");

  if (!item.unit) {
    throw new Error("Item unit missing. Fix item master");
  }

  const oldValue = item.quantity * item.avgCost;
  const newValue = quantity * unitCost;
  const newQty = item.quantity + quantity;
  // const totalCost = quantity * unitCost;
  item.quantity = newQty;
  item.avgCost = (oldValue + newValue) / newQty;

  await item.save();

  await Ledger.create({
    description: "Inventory Stock In",
    debitAccount,
    creditAccount,
    amount: newValue,
  });

  await InventoryTransaction.create({
    item: item._id,
    type: "IN",
    quantity,
    unitCost,
    totalAmount: newValue,
    debitAccount,
    creditAccount,
      reference,     // STOCK_IN / PURCHASE
  refId,         // optional
    createdBy: userId || null,
  });

  return {
    itemId: item._id,
    quantity: item.quantity,
    avgCost: item.avgCost,
  };
};

export const stockOut = async ({
  itemId,
  quantity,
  debitAccount,
  creditAccount,
  userId,
}) => {
  if (!itemId || quantity == null || !debitAccount || !creditAccount) {
    throw new Error("Missing required fields");
  }

  if (
    !mongoose.Types.ObjectId.isValid(itemId) ||
    !mongoose.Types.ObjectId.isValid(debitAccount) ||
    !mongoose.Types.ObjectId.isValid(creditAccount)
  ) {
    throw new Error("Invalid ID provided");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const item = await Item.findById(itemId);
  if (!item) throw new Error("Item not found");

  if (item.quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  const totalCost = quantity * item.avgCost;

  item.quantity -= quantity;
  await item.save();

  await Ledger.create({
    description: "Inventory Stock Out",
    debitAccount,
    creditAccount,
    amount: totalCost,
  });

  await InventoryTransaction.create({
    item: item._id,
    type: "OUT",
    quantity,
    unitCost: item.avgCost,
    totalAmount: totalCost,
    debitAccount,
    creditAccount,
    createdBy: userId || null,
  });

  return {
    itemId: item._id,
    quantity: item.quantity,
  };
};

export const listRawMaterials = async ({
  search = "",
  page = 1,
  limit = 20,
}) => {
  const query = {
    type: "RAW_MATERIAL",
    isActive: true,
    name: { $regex: search, $options: "i" },
  };

  const items = await Item.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return items.map((item) => ({
    id: item._id,
    code: item.code,
    name: item.name,
    unit: item.unit,
    type: item.type,
    quantity: item.quantity,
    avgCost: item.avgCost,
    value: item.quantity * item.avgCost,
  }));
};
export const normalizeQty = (qty, fromUnit, toUnit) => {
  if (!UNIT_MAP[fromUnit] || !UNIT_MAP[toUnit]) {
    throw new Error(`Unsupported unit conversion: ${fromUnit} → ${toUnit}`);
  }

  return (qty * UNIT_MAP[fromUnit]) / UNIT_MAP[toUnit];
};

export const consumeRecipeService = async ({
  recipeItems,
  debitAccount,
  creditAccount,
  description = "Attar Production",
}) => {
  if (!recipeItems || recipeItems.length === 0) {
    throw new Error("Recipe is empty");
  }

  let totalCost = 0;

  for (const r of recipeItems) {
    const item = await Item.findById(r.itemId);
    if (!item) throw new Error("Item not found");

    if (item.quantity < r.quantity) {
      throw new Error(`Insufficient stock: ${item.name}`);
    }

    const cost = r.quantity * item.avgCost;
    totalCost += cost;

    item.quantity -= r.quantity;
    await item.save();
  }

  await Ledger.create({
    description,
    debitAccount,
    creditAccount,
    amount: totalCost,
  });

  return { success: true, totalCost };
};

// console.log("REQ INPUT ITEMS:", inputItems);
export const conversionService = async ({
  finishedGoodId,
  outputQuantity,
  inputItems,
  reference,
  userId,
}) => {
  if (!finishedGoodId || !outputQuantity || !inputItems?.length) {
    throw new Error("Missing conversion fields");
  }

  let totalCost = 0;

  //  Consume RAW MATERIALS
  for (const input of inputItems) {
    const item = await Item.findById(input.rawMaterialId);
    if (!item) throw new Error("Raw material not found");

    if (item.quantity < input.quantity) {
      throw new Error(`Insufficient stock: ${item.name}`);
    }

    const cost = input.quantity * item.avgCost;
    totalCost += cost;

    item.quantity -= input.quantity;
    await item.save();

    await InventoryTransaction.create({
  // item: item._id,                 // raw material
  item: input.rawMaterialId,               
  finishedGood: finishedGoodId, 
  type: "OUT",
  quantity: Number(input.quantity),
  unitCost: item.avgCost,
  totalAmount: cost,
  reference: "CONVERSION",
  createdBy: userId || null,
});


  }

  //  Produce FINISHED GOOD
  const finishedGood = await Item.findById(finishedGoodId);
  if (!finishedGood) throw new Error("Finished good not found");

  const oldValue = finishedGood.quantity * finishedGood.avgCost;
  const newValue = totalCost;
  const newQty = finishedGood.quantity + Number(outputQuantity);

  finishedGood.quantity = newQty;
  finishedGood.avgCost = (oldValue + newValue) / newQty;

  await finishedGood.save();

  //  Inventory Transaction
await InventoryTransaction.create({
  item: finishedGood._id,
  finishedGood: finishedGood._id,

  type: "CONVERSION",
  quantity: Number(outputQuantity),
  totalAmount: totalCost,
  reference,
  inputItems: inputItems.map(i => ({
    rawMaterialId: i.rawMaterialId,
    quantity: Number(i.quantity),
  })),

  createdBy: userId || null,
});

await InventoryTransaction.create({
  item: finishedGood._id,
  type: "IN",
  quantity: Number(outputQuantity),
  unitCost: finishedGood.avgCost,
  totalAmount: totalCost,
  reference: "CONVERSION",
  createdBy: userId || null,
});
  
// isay kia hogha 
// await InventoryTransaction.create({
//   item: finishedGood._id,
//   type: "CONVERSION",
//   quantity: Number(outputQuantity),
//   totalAmount: totalCost,
//   reference,
//   inputItems: inputItems.map(i => ({
//     rawMaterialId: i.rawMaterialId,
//     quantity: Number(i.quantity),
//   })),
//   createdBy: userId || null,
// });

  return {
    finishedGood: finishedGood.name,
    outputQuantity,
    totalCost,
    avgCost: finishedGood.avgCost,
  };
};

export const listFinishedGoods = async () => {
  const items = await Item.find({ type: "FINISHED_GOOD", isActive: true });

  return items.map((item) => ({
    _id: item._id,
    code: item.code,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    avgCost: item.avgCost,
    value: item.quantity * item.avgCost,
  }));
};
