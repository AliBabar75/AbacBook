import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Filter, Eye, FileText } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api.js";

/* ================= TYPES ================= */

export interface Supplier extends Record<string, unknown> {
  _id?: string;
  id: string;
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
}

/* ================= COMPONENT ================= */

export default function Suppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    openingBalance: "",
  });

  /* ================= FETCH SUPPLIERS ================= */

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");

setSuppliers(
  res.data.suppliers.map((s: any) => ({
    id: s._id,
    code: s.code,
    name: s.name,
    phone: s.phone,
    email: s.email,
    balance: s.balance,
  }))
);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  /* ================= SAVE SUPPLIER ================= */

  const handleSaveSupplier = async () => {
  if (!form.name.trim()) {
    alert("Supplier name is required");
    return;
  }

  try {
    await api.post("/suppliers", {
      name: form.name.trim(),
      phone: form.phone || undefined,
      email: form.email || undefined,
      openingBalance: Number(form.openingBalance) || 0,
    });

    setShowAddSupplier(false);
    setForm({ name: "", phone: "", email: "", openingBalance: "" });

    await fetchSuppliers(); // 🔥 reload list
  } catch (err: any) {
    console.error("Failed to save supplier", err.response?.data || err);
    alert(err.response?.data?.message || "Failed to save supplier");
  }
};


  /* ================= TABLE COLUMNS ================= */

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
          <span
            className={
              balance > 0
                ? "amount-negative"
                : balance < 0
                ? "amount-positive"
                : ""
            }
          >
            {balance !== 0
              ? balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })
              : "—"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: Record<string, unknown>) => {
        const supplier = row as Supplier;

        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log("SUPPLIER:", supplier)}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(
                  `/parties/ledger?party=${supplier.id}&type=supplier`
                )
              }
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  /* ================= FILTER ================= */

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier accounts"
        icon={Users}
        actionLabel="Add Supplier"
        onAction={() => setShowAddSupplier(true)}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSuppliers as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No suppliers found"
      />

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Supplier</h2>

            <Input
              placeholder="Supplier Name"
              className="mb-3"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              className="mb-3"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              className="mb-3"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <Input
              placeholder="Opening Balance"
              type="number"
              className="mb-3"
              value={form.openingBalance}
              onChange={(e) =>
                setForm({ ...form, openingBalance: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddSupplier(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSupplier}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
