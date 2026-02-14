import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import api from "../../services/api.js";

type SaleRow = {
  id: string;
  date: string;
  invoiceNo: string;
  customer: string;
  items: string;
  type: string;
  qty: number;
  total: number;
  status: string;
};

export default function SalesList() {
  const navigate = useNavigate();
const location = useLocation(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

 
  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales");

      const formatted = res.data.map((sale: any) => ({
        id: sale._id,
        date: new Date(sale.date).toLocaleDateString(),
        invoiceNo: sale.invoiceNo,
        customer: sale.customerId?.name || "—",
        qty: sale.items?.length || 0,
        items:
          sale.items && sale.items.length > 0
            ? sale.items.map((i: any) => i.itemId?.name).join(", ")
            : "—",
        type:
          sale.items?.length > 0
            ? [...new Set(sale.items.map((i: any) => i.itemId?.type))].join(", ")
            : "—",
        total: sale.totalAmount,
        status: sale.status,
      returned: sale.totalReturned || 0,
netAmount:
  (sale.totalAmount || 0) - (sale.totalReturned || 0),
      }));

      setSales(formatted);
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchSales();
}, [location.pathname]);
 
  // RECEIVE PAYMENT
 
  const handleReceivePayment = async () => {
    if (!selectedSale) return;

    try {
      await api.post("/sales/payment", {
        saleId: selectedSale.id,
        amount: Number(paymentAmount),
        paymentMethod,
        date: new Date(),
      });
   const saleId = selectedSale.id;
      await fetchSales();

      setSelectedSale(null);
      setPaymentAmount("");
      navigate(`/sales/${saleId}/invoice`);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==============================
  // TABLE COLUMNS
  // ==============================
  const columns = [
    { key: "date", header: "Date" },
    { key: "invoiceNo", header: "Invoice No." },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Item Type" },
    { key: "items", header: "Items", className: "text-center" },
    { key: "qty", header: "Qty", className: "text-center" },
    { key: "total", header: "Total", className: "text-right" },
    { key: "returned", header: "Returned", className: "text-right" },
{ key: "netAmount", header: "Net Sale", className: "text-right" },
    {
      key: "status",
      header: "Status",
      render: (row: SaleRow) => {
        const variant =
          row.status === "PAID"
            ? "default"
            : row.status === "PARTIAL"
            ? "secondary"
            : "outline";

        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: SaleRow) => (
        <div className="flex gap-1">

          {/* View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
             navigate(`/sales/${row.id}/invoice`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Invoice */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/${row.id}/invoice`);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>

          {/* Payment */}
          {row.status !== "PAID" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSale(row);
                  }}
                >
                  Receive
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Receive Payment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                  <div>
                    <label className="text-sm">Amount</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) =>
                        setPaymentAmount(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Payment Method</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Card</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleReceivePayment}
                  >
                    Confirm Payment
                  </Button>

                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="View and manage sales orders"
        icon={ClipboardList}
        actionLabel="New Sale"
        onAction={() => navigate("/sales/new")}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredSales}
        loading={loading}
        emptyMessage="No sales found"
       
      />
    </div>
  );
}
