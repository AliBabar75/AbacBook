import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, Eye, FileText } from "lucide-react";
import api from "../../services/api.js";  
type SaleRow = {
  id: string;
  date: string;
  invoiceNo: string;
  customer: string;
  items: string;
  type:string;
qty:number;
  total: number;
  status: string;
};


export default function SalesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔗 FETCH SALES
  useEffect(() => {
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
      type:sale.items?.length > 0
      ? [...new Set(sale.items.map((i: any) => i.itemId?.type))].join(", ")
      : "—",
          total: sale.totalAmount,
          status: sale.status,
        }));

        setSales(formatted);
      } catch (err) {
        console.error("Failed to load sales", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: "date", header: "Date" },
    { key: "invoiceNo", header: "Invoice No." },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Item Type" },
    { key: "items", header: "Items", className: "text-center" },
    { key: "qty", header: "qty", className: "text-center" },
    { key: "total", header: "Total", className: "text-right" },
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
        onRowClick={(row) => navigate(`/sales/${row.id}`)}
      />
    </div>
  );
}
