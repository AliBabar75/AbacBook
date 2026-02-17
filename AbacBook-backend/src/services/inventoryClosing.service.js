import InventoryTransaction from "../modules/inventoryTransaction.model.js";
import Item from "../modules/item.model.js";

export const getInventoryClosingService = async ({
  asOfDate,
  itemType,
}) => {
  const startOfDay = new Date(asOfDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(asOfDate);
endOfDay.setHours(23, 59, 59, 999);

const txFilter = {
  createdAt: { $lte: endOfDay },
};


  const transactions = await InventoryTransaction.find(txFilter).lean();

  const itemMap = {};

  for (const tx of transactions) {
    const itemId = tx.item?.toString();

    if (!itemId) continue;

    if (!itemMap[itemId]) {
      itemMap[itemId] = {
        quantity: 0,
        value: 0,
      };
    }

    if (tx.type === "IN") {
      itemMap[itemId].quantity += tx.quantity;
      itemMap[itemId].value += tx.totalAmount || 0;
    }

    if (tx.type === "OUT") {
      itemMap[itemId].quantity -= tx.quantity;
      itemMap[itemId].value -= tx.totalAmount || 0;
    }

    // if (tx.type === "CONVERSION") {
    //   // Finished good increase
    //   if (tx.finishedGood) {
    //     const fgId = tx.finishedGood.toString();

    //     if (!itemMap[fgId]) {
    //       itemMap[fgId] = { quantity: 0, value: 0 };
    //     }

    //     itemMap[fgId].quantity += tx.quantity;
    //     itemMap[fgId].value += tx.totalAmount || 0;
    //   }

    //   // Raw material decrease
    //   if (tx.inputItems?.length) {
    //     for (const rm of tx.inputItems) {
    //       const rmId = rm.rawMaterialId?.toString();
    //       if (!rmId) continue;

    //       if (!itemMap[rmId]) {
    //         itemMap[rmId] = { quantity: 0, value: 0 };
    //       }

    //       itemMap[rmId].quantity -= rm.quantity;
    //     }
    //   }
    // }
  }

  // Fetch all items
  const items = await Item.find({ isActive: true }).lean();

  const result = [];

  for (const item of items) {
    if (itemType !== "all") {
      if (
        itemType === "raw-material" &&
        item.type !== "RAW_MATERIAL"
      )
        continue;

      if (
        itemType === "finished-good" &&
        item.type !== "FINISHED_GOOD"
      )
        continue;
    }

    const stock = itemMap[item._id.toString()] || {
      quantity: 0,
      value: 0,
    };

    result.push({
      code: item.code,
      name: item.name,
      type: item.type,
      unit: item.unit,
      quantity: stock.quantity,
      avgCost:
        stock.quantity !== 0
          ? stock.value / stock.quantity
          : 0,
      value: stock.value,
    });
  }

  const totalValue = result.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return {
    items: result,
    totalValue,
  };
};
