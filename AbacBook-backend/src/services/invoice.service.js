import Sale from "../modules/sale.model.js";
import SaleItem from "../modules/saleItem.model.js";
import Customer from "../modules/customer.model.js";
import Item from "../modules/item.model.js";

// =======================================================
// GET SALE INVOICE
// =======================================================

export const getSaleInvoice = async (saleId) => {
  if (!saleId) throw new Error("Sale ID required");

  const sale = await Sale.findById(saleId).lean();
  if (!sale) throw new Error("Sale not found");

  const customer = await Customer.findById(sale.customerId).lean();
  if (!customer) throw new Error("Customer not found");

  const saleItems = await SaleItem.find({ saleId: sale._id })
    .populate("itemId", "name unit")
    .lean();

  const items = saleItems.map((row) => ({
    name: row.itemId?.name || "Item",
    quantity: row.quantity,
    rate: row.rate,
    amount: row.amount,
  }));

  const subtotal = sale.totalAmount;
  const tax = 0; // future tax implementation
  const total = subtotal;

  const paid = sale.totalPaid || 0;
  const balance = total - paid;

  return {
    
    // HARDCODED COMPANY INFO
    
    company: {
      name: "AbacBook Pvt Ltd", //  replace with Company collection
      address: "Your Company Address Here",
      phone: "0300-0000000",
      email: "info@abacbook.com",
    },

    invoiceNo: sale.invoiceNo,
    date: sale.date,

    customer: {
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "", // optional (not required)
    },

    items,

    subtotal,
    tax,
    total,
    paid,
    balance,

    notes: sale.notes || "",
    status: sale.status,
  };
};
