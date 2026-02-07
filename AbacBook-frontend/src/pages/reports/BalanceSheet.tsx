import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Download, Printer } from "lucide-react";

/**
 * Balance Sheet Report - Reports Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/reports/balance-sheet
 * Query params: ?asOfDate=
 * Response: { assets, liabilities, equity }
 * 
 * This is a read-only report.
 * All calculations are done by the backend accounting engine.
 */
export default function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch balance sheet from API
  // const { data: report, loading } = useFetch(`/api/reports/balance-sheet?asOfDate=${asOfDate}`);
  const loading = false;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // window.open(`/api/reports/balance-sheet/export?asOfDate=${asOfDate}&format=pdf`, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Balance Sheet"
        subtitle="Financial position as of a specific date"
        icon={FileSpreadsheet}
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

      {/* Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-5 bg-muted animate-pulse rounded w-full" />
              ))}
            </div>
          ) : (
            <div>
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="text-lg font-bold text-foreground">Assets</h3>
              </div>

              {/* Current Assets */}
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground mb-3">Current Assets</h4>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Cash & Bank</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Accounts Receivable</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Inventory</span>
                    <span>—</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium mt-3 pt-2 border-t text-sm">
                  <span>Total Current Assets</span>
                  <span>—</span>
                </div>
              </div>

              {/* Non-Current Assets */}
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground mb-3">Non-Current Assets</h4>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Property & Equipment</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Less: Accumulated Depreciation</span>
                    <span>—</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium mt-3 pt-2 border-t text-sm">
                  <span>Total Non-Current Assets</span>
                  <span>—</span>
                </div>
              </div>

              {/* Total Assets */}
              <div className="p-4 bg-primary/5">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Assets</span>
                  {/* DATA COMES FROM CLIENT BACKEND API */}
                  <span className="text-primary">—</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liabilities & Equity */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-5 bg-muted animate-pulse rounded w-full" />
              ))}
            </div>
          ) : (
            <div>
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="text-lg font-bold text-foreground">Liabilities & Equity</h3>
              </div>

              {/* Current Liabilities */}
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground mb-3">Current Liabilities</h4>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Accounts Payable</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Accrued Expenses</span>
                    <span>—</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium mt-3 pt-2 border-t text-sm">
                  <span>Total Current Liabilities</span>
                  <span>—</span>
                </div>
              </div>

              {/* Non-Current Liabilities */}
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground mb-3">Non-Current Liabilities</h4>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Long-term Loans</span>
                    <span>—</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium mt-3 pt-2 border-t text-sm">
                  <span>Total Non-Current Liabilities</span>
                  <span>—</span>
                </div>
              </div>

              {/* Equity */}
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground mb-3">Equity</h4>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Capital</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground pl-2">Retained Earnings</span>
                    <span>—</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium mt-3 pt-2 border-t text-sm">
                  <span>Total Equity</span>
                  <span>—</span>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="p-4 bg-primary/5">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Liabilities & Equity</span>
                  {/* DATA COMES FROM CLIENT BACKEND API */}
                  <span className="text-primary">—</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
