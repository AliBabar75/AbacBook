import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, Eye } from "lucide-react";
import api from "../../services/api.js"

export default function PurchaseList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

const [purchases, setPurchases] = useState<Record<string, unknown>[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  api.get("/purchases")
    .then(res => {
      setPurchases(res.data.items);
    })
    .finally(() => setLoading(false));
}, []);
  const columns = [
    { key: "date", header: "Date" },
    { key: "invoiceNo", header: "Invoice No." },
    { key: "supplier", header: "Supplier" },
    {
  key: "itemname",
  header: "Purchase item",
  render: (row: any) => {
    if (Array.isArray(row.itemNames)) {
      return row.itemNames.join(", ");
    }
    return row.itemname || "—";
  },
},

    { key: "items", header: "Items", className: "text-center" },
    { key: "total", header: "Total", className: "text-right" },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        const variant = status === "paid" ? "default" : status === "partial" ? "secondary" : "outline";
        return <Badge variant={variant}>{status || "—"}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: Record<string, unknown>) => (
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
      ),
    },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 form-input-focus"
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
        emptyMessage="No purchases found. Data will be loaded from the backend API."
        onRowClick={(row) => navigate(`/purchases/${row.id}`)}
      />
    </div>
  );
}
