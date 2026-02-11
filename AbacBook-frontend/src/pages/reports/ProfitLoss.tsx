import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendingUp, Download, Printer } from "lucide-react";
import { useEffect } from "react";
import api from "@/services/api";
/**
 * Profit & Loss Report - Reports Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: GET /api/reports/profit-loss
 * Query params: ?startDate=&endDate=
 * Response: { revenue, costOfSales, grossProfit, expenses, netProfit }
 * 
 * This is a read-only report.
 * All calculations are done by the backend accounting engine.
 * Do NOT calculate profit or COGS in UI.
 */
export default function ProfitLoss() {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch P&L report from API
  // const { data: report, loading } = useFetch(
  //   `/api/reports/profit-loss?startDate=${filters.startDate}&endDate=${filters.endDate}`
  // );
 const [loading, setLoading] = useState(true);
const [report, setReport] = useState<any>(null);
useEffect(() => {
  async function load() {
    try {
      const res = await api.get("/reports/profit-loss", {
        params: {
          start: filters.startDate,
          end: filters.endDate,
        },
      });

      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [filters]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // window.open(`/api/reports/profit-loss/export?startDate=${filters.startDate}&endDate=${filters.endDate}&format=pdf`, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Profit & Loss"
        subtitle="Income statement for a period"
        icon={TrendingUp}
      />

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
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

      {/* P&L Statement */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded w-full" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Revenue Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Revenue</h3>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="pl-4">Sales Revenue</span>
<span>
                 {report?.revenue?.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2 })}

</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Other Income</span>
                  <span>—</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold mt-4 pt-2 border-t">
                <span>Total Revenue</span>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <span>—</span>
              </div>
            </div>

            {/* Cost of Sales Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cost of Sales</h3>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              {/* NOTE: COGS is calculated by backend accounting engine */}
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="pl-4">Opening Inventory</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Purchases</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Less: Closing Inventory</span>
                  <span>—</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold mt-4 pt-2 border-t">
                <span>Cost of Goods Sold</span>
                {/* DATA COMES FROM CLIENT BACKEND API */}
<span>
                {report?.cogs?.totalCOGS?.toLocaleString("en-US", { minimumFractionDigits: 2 })}

</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-6 bg-muted/30">
              <div className="flex justify-between text-lg font-bold">
                <span>Gross Profit</span>
                {/* DATA COMES FROM CLIENT BACKEND API */}
<span>

               {report?.grossProfit?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
</span>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Operating Expenses</h3>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="pl-4">Salaries & Wages</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Rent</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Utilities</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span className="pl-4">Other Expenses</span>
                  <span>—</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold mt-4 pt-2 border-t">
                <span>Total Operating Expenses</span>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <span>—</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="p-6 bg-primary/5">
              <div className="flex justify-between text-xl font-bold">
                <span>{report?.netProfit?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                {/* DATA COMES FROM CLIENT BACKEND API */}
                <span className="text-primary">—</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
