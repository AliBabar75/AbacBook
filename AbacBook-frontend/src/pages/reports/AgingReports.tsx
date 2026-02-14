import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Download, Printer } from "lucide-react";
import api from "@/services/api.js"
export default function AgingReports() {
  const [activeTab, setActiveTab] = useState("receivable");
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FETCH AGING REPORT
  // =========================================================
 useEffect(() => {
  const fetchAging = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/reports/aging/${activeTab}`,
        {
          params: { asOfDate },
        }
      );

      setReport(data);
    } catch (err) {
      console.error("Aging fetch error:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  fetchAging();
}, [activeTab, asOfDate]);

  const parties = report?.parties || [];

  // =========================================================
  // TABLE COLUMNS
  // =========================================================
  const columns = [
    { key: "name", header: "Party Name" },
    {
      key: "current",
      header: "Current",
      className: "text-right",
      render: (row: any) => formatAmount(row.current),
    },
    {
      key: "days1_30",
      header: "1-30 Days",
      className: "text-right",
      render: (row: any) => formatAmount(row.days1_30),
    },
    {
      key: "days31_60",
      header: "31-60 Days",
      className: "text-right",
      render: (row: any) => formatAmount(row.days31_60),
    },
    {
      key: "days61_90",
      header: "61-90 Days",
      className: "text-right",
      render: (row: any) => formatAmount(row.days61_90),
    },
    {
      key: "over90",
      header: "Over 90 Days",
      className: "text-right",
      render: (row: any) => {
        const value = row.over90;
        return value > 0 ? (
          <span className="text-destructive font-medium">
            {formatAmount(value)}
          </span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "total",
      header: "Total",
      className: "text-right font-semibold",
      render: (row: any) => formatAmount(row.total),
    },
  ];

  function formatAmount(value: number | undefined): string {
    if (!value || value === 0) return "—";
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
  }

  const handlePrint = () => {
    window.print();
  };

const handleExport = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  window.open(
    `${baseURL}/reports/aging/${activeTab}?asOfDate=${asOfDate}`,
    "_blank"
  );
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
          <TabsTrigger value="receivable">
            Accounts Receivable
          </TabsTrigger>
          <TabsTrigger value="payable">
            Accounts Payable
          </TabsTrigger>
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
            <SummaryCard
              title="Current"
              value={report?.totals?.current}
              color="text-success"
            />

            <SummaryCard
              title="1-30 Days"
              value={report?.totals?.days1_30}
            />

            <SummaryCard
              title="31-90 Days"
              value={
                (report?.totals?.days31_60 || 0) +
                (report?.totals?.days61_90 || 0)
              }
              color="text-warning"
            />

            <SummaryCard
              title="Over 90 Days"
              value={report?.totals?.over90}
              color="text-destructive"
            />
          </div>

          {/* Report Table */}
          <DataTable
            columns={columns}
            data={parties}
            loading={loading}
            emptyMessage={`No ${
              activeTab === "receivable" ? "receivable" : "payable"
            } aging data.`}
          />

          {/* Grand Total */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Total{" "}
                {activeTab === "receivable"
                  ? "Receivables"
                  : "Payables"}
              </span>
              <span className="text-xl font-bold text-primary">
                {formatAmount(report?.totals?.grandTotal)}
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =========================================================
// SUMMARY CARD COMPONENT
// =========================================================
function SummaryCard({
  title,
  value,
  color = "",
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value
          ? value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })
          : "—"}
      </p>
    </div>
  );
}
