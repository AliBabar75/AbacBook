import * as InvoiceService from "../services/invoice.service.js";

export const getSaleInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await InvoiceService.getSaleInvoice(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
