import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, FileSpreadsheet } from "lucide-react";
import api from "@/services/api.js"
export default function Invoice() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FETCH INVOICE FROM BACKEND
  // =========================================================
  useEffect(() => {
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/sales/${id}/invoice`);
      setInvoice(data);
    } catch (error) {
      console.error(error);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchInvoice();
}, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-8">Invoice not found.</div>;
  }

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
            <p className="text-sm text-muted-foreground">
              View invoice details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
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
              <h2 className="text-xl font-bold text-foreground">
                {invoice.company.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {invoice.company.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.company.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.company.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-primary">INVOICE</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Invoice # {invoice.invoiceNo}
            </p>
            <p className="text-sm text-muted-foreground">
              Date: {invoice.date?.slice(0, 10)}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {invoice.status}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Bill To
            </h4>
            <p className="text-foreground font-medium">
              {invoice.customer.name}
            </p>
            {invoice.customer.address && (
              <p className="text-sm text-muted-foreground">
                {invoice.customer.address}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {invoice.customer.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.customer.email}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-semibold text-muted-foreground">
                  Item
                </th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                  Qty
                </th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                  Rate
                </th>
                <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, index: number) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3">{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">
                    {item.rate.toLocaleString()}
                  </td>
                  <td className="text-right font-medium">
                    {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Paid</span>
              <span>{invoice.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary">
                {invoice.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-semibold">Balance</span>
              <span className="font-bold text-destructive">
                {invoice.balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Notes
            </h4>
            <p className="text-sm text-muted-foreground">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
}
