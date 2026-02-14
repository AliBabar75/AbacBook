import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Wallet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import api from "../../services/api.js";

export default function PurchaseList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isOpen, setIsOpen] = useState(false);

  const loadPurchases = async () => {
    setLoading(true);
    const res = await api.get("/purchases");
    setPurchases(res.data.items);
    setLoading(false);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handlePayment = async () => {
    if (!selectedPurchase) return;

    await api.post("/purchases/payment", {
      purchaseId: selectedPurchase.id,
      amount: Number(paymentAmount),
      paymentMethod,
      date: new Date()
    });

    setIsOpen(false);
    setPaymentAmount("");
    loadPurchases();
  };

  const columns = [
    { key: "date", header: "Date" },
    { key: "invoiceNo", header: "Invoice No." },
    { key: "supplier", header: "Supplier" },
    { key: "items", header: "Items", className: "text-center" },
    { key: "total", header: "Total", className: "text-right" },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const variant =
          row.status === "paid"
            ? "default"
            : row.status === "partial"
            ? "secondary"
            : "outline";

        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/purchases/${row.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {row.status !== "paid" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPurchase(row);
                setIsOpen(true);
              }}
            >
              <Wallet className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="View and manage purchase orders"
        icon={ClipboardList}
        actionLabel="New Purchase"
        onAction={() => navigate("/purchases/new")}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
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
        data={purchases}
        loading={loading}
        emptyMessage="No purchases found."
        onRowClick={(row) => navigate(`/purchases/${row.id}`)}
      />

      {/* Payment Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Supplier</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <Button className="w-full" onClick={handlePayment}>
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
