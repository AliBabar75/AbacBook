import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Filter } from "lucide-react";
import api from "../../services/api.js";

type FinishedGood = {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  avgCost: number;
  value: number;
};

export default function FinishedGoods() {
  const [goods, setGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    unit: "PCS",
  });

  /* ================================
     TABLE COLUMNS
  ================================= */
  const columns = [
    { key: "code", header: "Item Code" },
    { key: "name", header: "Name" },
    { key: "unit", header: "Unit" },
    { key: "quantity", header: "Quantity", className: "text-right" },
    { key: "avgCost", header: "Avg Cost", className: "text-right" },
    { key: "value", header: "Value", className: "text-right" },
  ];

  /* ================================
     LOAD FINISHED GOODS
  ================================= */
  const loadFinishedGoods = async () => {
    setLoading(true);
    try {
      const res = await api.get("/inventory/finished-goods", {
        params: { search },
      });
      setGoods(res.data.items || []);
    } catch (err) {
      console.error("Failed to load finished goods", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinishedGoods();
  }, [search]);

  /* ================================
     SAVE FINISHED GOOD
  ================================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      await api.post("/items", {
        ...form,
        type: "FINISHED_GOOD",
      });

      setForm({ code: "", name: "", unit: "PCS" });
      setShowForm(false);
      loadFinishedGoods();
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <PageHeader
        title="Finished Goods"
        subtitle="Manage finished goods inventory"
        icon={Package}
        actionLabel="Add Product"
        onAction={() => setShowForm(!showForm)}
      />

      {/* ================= ADD FORM ================= */}
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/30 max-w-xl">
          <Input
            placeholder="Item Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="mb-2"
          />

          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mb-2"
          />

          <Input
            placeholder="Unit (PCS)"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="mb-3"
          />

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search finished goods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* ================= TABLE ================= */}
      <DataTable<FinishedGood>
        columns={columns}
        data={goods}
        loading={loading}
        emptyMessage="No finished goods found."
      />
    </div>
  );
}
