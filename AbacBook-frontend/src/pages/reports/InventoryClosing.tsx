import { useEffect, useState } from "react";
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
import { Package, Download, Printer } from "lucide-react";
import api from "@/services/api.js";

export default function InventoryClosing() {
  const [filters, setFilters] = useState({
    asOfDate: new Date().toISOString().split("T")[0],
    itemType: "all",
  });

  const [items, setItems] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const res = await api.get("/inventory-closing", {
          params: {
            asOfDate: filters.asOfDate,
            itemType: filters.itemType,
          },
        });

        setItems(res.data.items || []);
        setTotalValue(res.data.totalValue || 0);
      } catch (err) {
        console.error(err);
        setItems([]);
        setTotalValue(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.asOfDate, filters.itemType]);

  const columns = [
    { key: "code", header: "Item Code" },
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "unit", header: "Unit" },
    { key: "quantity", header: "Quantity", className: "text-right" },
    {
      key: "avgCost",
      header: "Avg. Cost",
      className: "text-right",
    },
    {
      key: "value",
      header: "Value",
      className: "text-right",
      render: (row: any) => {
        const value = Number(row.value || 0);
        return (
          <span className="font-medium">
            {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {};

  return (
    <div>
      <PageHeader
        title="Inventory Closing Report"
        subtitle="Stock valuation as of a specific date"
        icon={Package}
      />

      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2">
            <Label>As of Date</Label>
            <Input
              type="date"
              value={filters.asOfDate}
              onChange={(e) =>
                setFilters({ ...filters, asOfDate: e.target.value })
              }
              className="form-input-focus"
            />
          </div>

          <div className="space-y-2">
            <Label>Item Type</Label>
            <Select
              value={filters.itemType}
              onValueChange={(value) =>
                setFilters({ ...filters, itemType: value })
              }
            >
              <SelectTrigger className="form-input-focus w-48">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="raw-material">Raw Materials</SelectItem>
                <SelectItem value="finished-good">Finished Goods</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No inventory data available. Report will be loaded from the backend API."
      />

      <div className="bg-card rounded-xl border border-border p-4 shadow-card mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">
            Total Inventory Value
          </span>
          <span className="text-xl font-bold text-primary">
            {totalValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
