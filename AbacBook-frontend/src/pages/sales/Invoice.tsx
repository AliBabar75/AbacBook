import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, FileSpreadsheet } from "lucide-react";

/**
 * Invoice View - Sales Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/sales/:id/invoice
 * Response: { invoice details including company info, customer, items, totals }
 * 
 * NOTE: All calculations come from backend.
 * This is a read-only invoice view.
 */
export default function Invoice() {
  const navigate = useNavigate();
  const { id } = useParams();

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch invoice data from API
  // const { data: invoice, loading } = useFetch(`/api/sales/${id}/invoice`);

  const handlePrint = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // Print functionality can use window.print() or generate PDF from backend
    window.print();
  };

  const handleDownload = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // TODO: Download PDF from API
    // window.open(`/api/sales/${id}/invoice/pdf`, '_blank');
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sales")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoice</h1>
            <p className="text-sm text-muted-foreground">View invoice details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-card rounded-xl border border-border p-8 shadow-card max-w-4xl mx-auto print:shadow-none print:border-none">
        {/* Company Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AbacBook</h2>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <p className="text-sm text-muted-foreground">Company details loaded from API</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-primary">INVOICE</h3>
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <p className="text-sm text-muted-foreground mt-1">Invoice # —</p>
            <p className="text-sm text-muted-foreground">Date: —</p>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill To</h4>
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <p className="text-foreground font-medium">Customer name loaded from API</p>
            <p className="text-sm text-muted-foreground">Address loaded from API</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Payment Terms</h4>
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <p className="text-foreground">Terms loaded from API</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Item</th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">Qty</th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">Rate</th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  Invoice items will be loaded from the backend API
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">—</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary">—</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Notes</h4>
          {/* DATA COMES FROM CLIENT BACKEND API */}
          <p className="text-sm text-muted-foreground">Notes loaded from API</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">Thank you for your business!</p>
          {/* DATA COMES FROM CLIENT BACKEND API */}
          <p className="text-xs text-muted-foreground mt-1">Company contact details loaded from API</p>
        </div>
      </div>
    </div>
  );
}
