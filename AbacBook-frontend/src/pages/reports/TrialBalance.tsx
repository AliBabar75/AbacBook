import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Scale, Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api.js";
/**
 * Trial Balance Report - Reports Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/reports/trial-balance
 * Query params: ?asOfDate=
 * Response: { accounts: [{ code, name, debit, credit }], totals: { debit, credit } }
 * 
 * This is a read-only report.
 * All calculations are done by the backend accounting engine.
 */
export default function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch trial balance from API
  // const { data: report, loading } = useFetch(`/api/reports/trial-balance?asOfDate=${asOfDate}`);
const [loading, setLoading] = useState(true);
const [accounts, setAccounts] = useState<any[]>([]);
const [totals, setTotals] = useState({ debit: 0, credit: 0 });
useEffect(() => {
  async function load() {
    try {
      const res = await api.get("/reports/trial-balance", {
        params: { date: asOfDate },
      });

      setAccounts(res.data.accounts || []);
      setTotals({
        debit: res.data.totalDebit || 0,
        credit: res.data.totalCredit || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [asOfDate]);

  const columns = [
    { key: "code", header: "Account Code" },
    { key: "name", header: "Account Name" },
    { 
      key: "debit", 
      header: "Debit", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const debit = Number(row.debit || 0);
        return debit > 0 ? (
          <div className="text-right">
  {totals.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
</div>
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
        <div className="text-right">
  {totals.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
</div>
        ) : "—";
      },
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // TODO: Export report from API
    // window.open(`/api/reports/trial-balance/export?asOfDate=${asOfDate}&format=pdf`, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Trial Balance"
        subtitle="View account balances as of a specific date"
        icon={Scale}
      />

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label>As of Date</Label>
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="form-input-focus"
            />
          </div>
          <div className="flex gap-2">
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

      {/* Report Table */}
      {/* DATA COMES FROM CLIENT BACKEND API */}
      <DataTable
        columns={columns}
        data={accounts}
        loading={loading}
        emptyMessage="No data available. Trial balance will be loaded from the backend API."
      />

      {/* Totals */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card mt-4">
        <div className="grid grid-cols-4 gap-4 font-semibold">
          <div className="col-span-2 text-right">Total</div>
          {/* DATA COMES FROM CLIENT BACKEND API */}
          <div className="text-right">—</div>
          <div className="text-right">—</div>
        </div>
      </div>
    </div>
  );
}
