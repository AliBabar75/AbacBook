import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Filter, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Customers List - Parties Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/parties/customers
 * Response: { customers: [{ id, name, email, phone, balance }] }
 */
export default function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch customers from API
  // const { data: customers, loading } = useFetch('/api/parties/customers');
  const loading = false;
  const customers: Record<string, unknown>[] = [];

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { 
      key: "balance", 
      header: "Balance", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const balance = Number(row.balance || 0);
        return (
          <span className={balance > 0 ? "amount-positive" : balance < 0 ? "amount-negative" : ""}>
            {balance !== 0 ? balance.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"}
          </span>
        );
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
              // DATA COMES FROM CLIENT BACKEND API
              // TODO: View customer details
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/parties/ledger?party=${row.id}&type=customer`);
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
        title="Customers"
        subtitle="Manage customer accounts"
        icon={Users}
        actionLabel="Add Customer"
        onAction={() => {
          // DATA COMES FROM CLIENT BACKEND API
          // TODO: Open add customer modal
        }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
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
        data={customers}
        loading={loading}
        emptyMessage="No customers found. Data will be loaded from the backend API."
      />
    </div>
  );
}
