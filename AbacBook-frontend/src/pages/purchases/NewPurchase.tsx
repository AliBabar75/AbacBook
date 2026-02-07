import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api.js";

/* ===================== TYPES ===================== */
interface PurchaseItem {
  id: string;
  itemId: string;
  quantity: string;
  rate: string;
}

/* ===================== COMPONENT ===================== */
export default function NewPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    invoiceNo: "",
    supplierId: "",
    paymentTerms: "",
    notes: "",
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { id: "1", itemId: "", quantity: "", rate: "" },
  ]);

  const [suppliers, setSuppliers] = useState<
    { id: string; name: string }[]
  >([]);

  const [inventoryItems, setInventoryItems] = useState<
    { id: string; name: string }[]
  >([]);

  /* ===================== LOAD SUPPLIERS ===================== */
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await api.get("/suppliers");

        const list = Array.isArray(res.data.suppliers)
          ? res.data.suppliers
          : [];

        setSuppliers(
          list
            .filter((s: any) => s._id)
            .map((s: any) => ({
              id: String(s._id),
              name: s.name,
            }))
        );
      } catch (err) {
        console.error("Failed to load suppliers", err);
      }
    };

    loadSuppliers();
  }, []);

  /* ===================== LOAD RAW MATERIALS ===================== */
  useEffect(() => {
  const loadItems = async () => {
    try {
      const res = await api.get("/inventory/raw-materials");

      console.log("RAW MATERIAL API:", res.data);

      const list =
        res.data.items ||
        res.data.rawMaterials ||
        res.data.data ||
        [];

      setInventoryItems(
        Array.isArray(list)
          ? list
              .filter((i: any) => i?.id)
              .map((i: any) => ({
                id: String(i.id),
                name: i.name,
              }))
          : []
      );
    } catch (err) {
      console.error("Failed to load inventory items", err);
    }
  };

  loadItems();
}, []);

  /* ===================== ITEM HANDLERS ===================== */
  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), itemId: "", quantity: "", rate: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof PurchaseItem,
    value: string
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔒 VALIDATION
    if (!formData.supplierId) {
      alert("Please select supplier");
      setLoading(false);
      return;
    }

    if (items.some((i) => !i.itemId)) {
      alert("Please select item in all rows");
      setLoading(false);
      return;
    }

    try {
      await api.post("/purchases", {
        date: formData.date,
        invoiceNo: formData.invoiceNo,
        supplierId: formData.supplierId,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        items: items.map((i) => ({
          itemId: i.itemId,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
        })),
      });

      navigate("/purchases");
    } catch (error) {
      console.error("Purchase creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Purchase</h1>
          <p className="text-sm text-muted-foreground">
            Create a new purchase order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Invoice No</Label>
              <Input
                value={formData.invoiceNo}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNo: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Supplier</Label>
              <Select
                value={formData.supplierId || undefined}
                onValueChange={(v) =>
                  setFormData({ ...formData, supplierId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Select
                value={formData.paymentTerms || undefined}
                onValueChange={(v) =>
                  setFormData({ ...formData, paymentTerms: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net45">Net 45</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Items</h2>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {items.map((item) => {
            const amount =
              Number(item.quantity || 0) * Number(item.rate || 0);

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4"
              >
                <Select
                  value={item.itemId || undefined}
                  onValueChange={(v) =>
                    updateItem(item.id, "itemId", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(item.id, "rate", e.target.value)
                  }
                />

                <Input value={amount.toFixed(2)} disabled />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* NOTES */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <Label>Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/purchases")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            Save Purchase
          </Button>
        </div>
      </form>
    </div>
  );
}
