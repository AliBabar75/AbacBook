import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, Eye, FileText } from "lucide-react";

/**
 * Sales List - Sales Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/sales
 * Response: { sales: [{ id, date, customer, items, total, status }] }
 * 
 * NOTE: Do NOT calculate profit or COGS in UI.
 * All financial calculations are handled by the backend.
 */
export default function SalesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch sales from API
  // const { data: sales, loading } = useFetch('/api/sales');
  const loading = false;
  const sales: Record<string, unknown>[] = [];

  const columns = [
    { key: "date", header: "Date" },
    { key: "invoiceNo", header: "Invoice No." },
    { key: "customer", header: "Customer" },
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
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/${row.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // DATA COMES FROM CLIENT BACKEND API
              navigate(`/sales/${row.id}/invoice`);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..."
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

      {/* DATA COMES FROM CLIENT BACKEND API */}
      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        emptyMessage="No sales found. Data will be loaded from the backend API."
        onRowClick={(row) => navigate(`/sales/${row.id}`)}
      />
    </div>
  );
}
