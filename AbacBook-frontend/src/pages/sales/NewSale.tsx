import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api.js";
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
import { Save, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

interface SaleItem {
  id: string;
  itemId: string;
  quantity: string;
  rate: string;
}
interface Customer {
  id: string;
  name: string;
}

export default function NewSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ================= FORM =================
 const [formData, setFormData] = useState({
  date: new Date().toISOString().split("T")[0],
  invoiceNo: "",
  customerId: "",          // ✅ EMPTY STRING ONLY
  paymentTerms: "",
  notes: "",
});


  const [items, setItems] = useState<SaleItem[]>([
    { id: "1", itemId: "", quantity: "", rate: "" },
  ]);

  // ================= DATA =================
  // const [customers, setCustomers] = useState<{ _id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<{ id: string; name: string }[]>([]);

  // ================= LOAD CUSTOMERS =================
 useEffect(() => {
  api.get("/customers").then((res) => {
    setCustomers(
      res.data.map((c: any) => ({
        id: String(c.id),
        name: c.name,
      }))
    );
  });
}, []);

  // ================= LOAD FINISHED GOODS =================
  useEffect(() => {
    
    api.get("/items?type=FINISHED_GOOD").then((res) => {
      setFinishedGoods(
        res.data.map((i: any) => ({
          id: String(i._id), // IMPORTANT: string
          name: i.name,
        }))
      );
    });
  }, []);

  // ================= ITEM HANDLERS =================
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), itemId: "", quantity: "", rate: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof SaleItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.customerId === "undefined") {
  alert("Please select a customer");
  
  setLoading(false);
  return;
}
    setLoading(true);

    try {
      await api.post("/sales", {
        date: formData.date,
        invoiceNo: formData.invoiceNo,
        customerId: formData.customerId,
        notes: formData.notes,
        items: items.map((i) => ({
          itemId: i.itemId,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
        })),
      });

      navigate("/sales");
    } catch (error) {
      console.error("Sale creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sales")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Sale</h1>
          <p className="text-sm text-muted-foreground">Create a new sales invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ================= SALE DETAILS ================= */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Sale Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Invoice No.</Label>
              <Input
                placeholder="e.g. INV-001"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
  <Select
  value={formData.customerId}
  onValueChange={(v) => {
    console.log("Selected customerId:", v);
    setFormData((prev) => ({ ...prev, customerId: v }));
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Select customer" />
  </SelectTrigger>

  <SelectContent>
    {customers.map((c) => (
      <SelectItem key={c.id} value={c.id}>
        {c.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            </div>

            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net45">Net 45</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ================= ITEMS ================= */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* TABLE HEADER */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* ITEMS ROWS */}
          <div className="space-y-4 mt-4">
            {items.map((item, index) => {
              const amount = Number(item.quantity || 0) * Number(item.rate || 0);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                >
                  <div className="md:col-span-5 space-y-2">
                    <Label className="md:hidden">Item {index + 1}</Label>
                    <Select
                      value={item.itemId}
                      onValueChange={(v) => updateItem(item.id, "itemId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {finishedGoods.map((fg) => (
                          <SelectItem key={fg.id} value={fg.id}>
                            {fg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="text-right"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Rate</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="text-right"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 text-right font-medium py-2">
                    {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= NOTES ================= */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <Label>Notes</Label>
          <Textarea
            placeholder="Additional notes for this sale..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
