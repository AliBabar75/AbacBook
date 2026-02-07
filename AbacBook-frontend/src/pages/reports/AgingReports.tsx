import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Download, Printer } from "lucide-react";

/**
 * Aging Reports - Reports Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoints:
 * - GET /api/reports/aging/receivable - Accounts receivable aging
 * - GET /api/reports/aging/payable - Accounts payable aging
 * Query params: ?asOfDate=
 * Response: { parties: [{ name, current, 1-30, 31-60, 61-90, over90, total }], totals }
 * 
 * This is a read-only report.
 * All calculations are done by the backend accounting engine.
 */
export default function AgingReports() {
  const [activeTab, setActiveTab] = useState("receivable");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch aging report from API based on activeTab
  // const { data: report, loading } = useFetch(
  //   `/api/reports/aging/${activeTab}?asOfDate=${asOfDate}`
  // );
  const loading = false;
  const parties: Record<string, unknown>[] = [];

  const columns = [
    { key: "name", header: "Party Name" },
    { 
      key: "current", 
      header: "Current", 
      className: "text-right",
      render: (row: Record<string, unknown>) => formatAmount(row.current as number),
    },
    { 
      key: "days1_30", 
      header: "1-30 Days", 
      className: "text-right",
      render: (row: Record<string, unknown>) => formatAmount(row.days1_30 as number),
    },
    { 
      key: "days31_60", 
      header: "31-60 Days", 
      className: "text-right",
      render: (row: Record<string, unknown>) => formatAmount(row.days31_60 as number),
    },
    { 
      key: "days61_90", 
      header: "61-90 Days", 
      className: "text-right",
      render: (row: Record<string, unknown>) => formatAmount(row.days61_90 as number),
    },
    { 
      key: "over90", 
      header: "Over 90 Days", 
      className: "text-right",
      render: (row: Record<string, unknown>) => {
        const value = row.over90 as number;
        return value > 0 ? (
          <span className="text-destructive font-medium">
            {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        ) : "—";
      },
    },
    { 
      key: "total", 
      header: "Total", 
      className: "text-right font-semibold",
      render: (row: Record<string, unknown>) => formatAmount(row.total as number),
    },
  ];

  function formatAmount(value: number | undefined): string {
    if (!value || value === 0) return "—";
    return value.toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // DATA COMES FROM CLIENT BACKEND API
    // window.open(`/api/reports/aging/${activeTab}/export?asOfDate=${asOfDate}&format=pdf`, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Aging Reports"
        subtitle="Receivable and payable aging analysis"
        icon={Clock}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="receivable">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="payable">Accounts Payable</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
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
              <div className="flex gap-2 ml-auto">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* DATA COMES FROM CLIENT BACKEND API */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-bold text-success">—</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-sm text-muted-foreground">1-30 Days</p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-sm text-muted-foreground">31-90 Days</p>
              <p className="text-xl font-bold text-warning">—</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="text-sm text-muted-foreground">Over 90 Days</p>
              <p className="text-xl font-bold text-destructive">—</p>
            </div>
          </div>

          {/* Report Table */}
          {/* DATA COMES FROM CLIENT BACKEND API */}
          <DataTable
            columns={columns}
            data={parties}
            loading={loading}
            emptyMessage={`No ${activeTab === "receivable" ? "receivable" : "payable"} aging data. Report will be loaded from the backend API.`}
          />

          {/* Totals */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Total {activeTab === "receivable" ? "Receivables" : "Payables"}
              </span>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <span className="text-xl font-bold text-primary">—</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
