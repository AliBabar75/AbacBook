import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Printer } from "lucide-react";

/**
 * Ledger View - Parties Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/parties/:id/ledger
 * Query params: ?startDate=&endDate=
 * Response: { party, openingBalance, transactions, closingBalance }
 * 
 * This is a read-only ledger view.
 * All calculations are done by the backend.
 */
export default function Ledger() {
  const [searchParams] = useSearchParams();
  const partyId = searchParams.get("party");
  const partyType = searchParams.get("type");

  const [filters, setFilters] = useState({
    partyType: partyType || "",
    partyId: partyId || "",
    startDate: "",
    endDate: new Date().toISOString().split("T")[0],
  });

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch parties list based on type
  // const { data: parties } = useFetch(`/api/parties/${filters.partyType}s`);
  const parties: { id: string; name: string }[] = [];

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch ledger data
  // const { data: ledger, loading } = useFetch(
  //   `/api/parties/${filters.partyId}/ledger?startDate=${filters.startDate}&endDate=${filters.endDate}`
  // );
  const loading = false;
  const transactions: Record<string, unknown>[] = [];

  const columns = [
    { key: "date", header: "Date" },
    { key: "particulars", header: "Particulars" },
    { key: "reference", header: "Reference" },
    { 
      key: "debit", 
      header: "Debit", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const debit = Number(row.debit || 0);
        return debit > 0 ? (
          <span className="font-medium">{debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        ) : "—";
      },
    },
    { 
      key: "credit", 
      header: "Credit", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const credit = Number(row.credit || 0);
        return credit > 0 ? (
          <span className="font-medium">{credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        ) : "—";
      },
    },
    { 
      key: "balance", 
      header: "Balance", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const balance = Number(row.balance || 0);
        return (
          <span className={balance > 0 ? "amount-positive" : balance < 0 ? "amount-negative" : "font-medium"}>
            {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // TODO: Export ledger to PDF/Excel from API
    // window.open(`/api/parties/${filters.partyId}/ledger/export?format=pdf`, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="View party account transactions"
        icon={FileText}
      />

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Party Type</Label>
            <Select
              value={filters.partyType}
              onValueChange={(value) => setFilters({ ...filters, partyType: value, partyId: "" })}
            >
              <SelectTrigger className="form-input-focus">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Party</Label>
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <Select
              value={filters.partyId}
              onValueChange={(value) => setFilters({ ...filters, partyId: value })}
            >
              <SelectTrigger className="form-input-focus">
                <SelectValue placeholder="Select party" />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name}
                  </SelectItem>
                ))}
                {parties.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    Parties loaded from API
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="form-input-focus"
            />
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="form-input-focus"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Ledger Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* DATA COMES FROM CLIENT BACKEND API */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Opening Balance</p>
          <p className="text-xl font-bold">—</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-xl font-bold">—</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Closing Balance</p>
          <p className="text-xl font-bold">—</p>
        </div>
      </div>

      {/* Transactions Table */}
      {/* DATA COMES FROM CLIENT BACKEND API */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="Select a party to view ledger. Data will be loaded from the backend API."
      />
    </div>
  );
}
