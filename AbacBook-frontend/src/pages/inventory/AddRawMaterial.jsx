import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createItem } from "@/services/inventory.service";

export default function AddRawMaterial({ onSuccess }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "",
    unit: "",
    quantity:"",
    avgCost:"",
    
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      await createItem(form);

      setForm({
        code: "",
        name: "",
        type: "",
        unit: "",
      quantity:"",
      avgCost:"",
      
      });

      onSuccess && onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create raw material"
      );
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (!form.name) return;

  if (form.name.toLowerCase().includes("oil")) {
    setForm(prev => ({
      ...prev,
      unit: "ML",
    }));
  }
}, [form.name]);
  return (
    <div className="border p-4 rounded mb-6 bg-white">
      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="Item Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <Input
          placeholder="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />


<Input
  placeholder="Material type"
  value={form.type}
  onChange={(e) => setForm({ ...form, type: e.target.value })}
/>
        <Input
          placeholder="Unit (ml, gm, kg)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
        <Input
          placeholder="quantity )"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <Input
          placeholder="Avgcost"
          value={form.avgCost}
          onChange={(e) => setForm({ ...form, avgCost: e.target.value })}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <div className="mt-4">
        <Button onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
