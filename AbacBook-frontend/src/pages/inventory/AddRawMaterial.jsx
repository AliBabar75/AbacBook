import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createItem } from "@/services/inventory.service";
import { useToast } from "@/components/ui/use-toast";

export default function AddRawMaterial({ onSuccess }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "RAW_MATERIAL",
    unit: "",
    // quantity:"",
    // avgCost:"",
    
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      await createItem(form);
toast({
  title: "Success",
  description: "Raw Material Saved Successfully",
});
      setForm({
        code: "",
        name: "",
        type: "",
        unit: "",
      quantity:"",
      avgCost:"",
      
      });

      onSuccess && onSuccess();
    }catch (err) {

  const msg = err?.response?.data?.message;

  toast({
    title: "Error",
    description: msg || "Something went wrong. Please try again.",
    variant: "destructive",
  });

  setError(msg || "Something went wrong. Please try again.");
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
        {/* <Input
          placeholder="quantity )"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <Input
          placeholder="Avgcost"
          value={form.avgCost}
          onChange={(e) => setForm({ ...form, avgCost: e.target.value })}
        /> */}
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
