import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";

export const reconcileSales = async () => {
  const sales = await Sale.find();

  for (const sale of sales) {

    const items = await SaleItem.find({ saleId: sale._id });

    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    if (calculatedTotal !== sale.totalAmount) {
      console.log("Mismatch found in:", sale.invoiceNo);
    }
  }
};
