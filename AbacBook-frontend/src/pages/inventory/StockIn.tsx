import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { PackagePlus, Save, Loader2 } from "lucide-react";
import api from "../../services/api.js";
interface Item {
  _id: string;
  name: string;
  type?: string;
}
export default function StockIn() {
  const [loading, setLoading] = useState(false);
 const [items, setItems] = useState<Item[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Record<string, unknown>[]>([]);
const [accounts, setAccounts] = useState([]);

 const [formData, setFormData] = useState({
  date: new Date().toISOString().split("T")[0],
  itemType: "",
  itemId: "",
  quantity: "",
  unitCost: "",        
  debitAccount: "",    
  creditAccount: "",   
  reference: "",
  notes: "",
});


useEffect(() => {
   const loadHistory = async () => {
    try {
      const res = await api.get("/inventory/history");
      console.log("HISTORY:", res.data); // 🔍 DEBUG
      // setRecentTransactions(res.data);
      setRecentTransactions(res.data.filter(t => t.type === "IN"));
    } catch (err) {
      console.error("Stock history load failed", err);
    }
  };

  loadHistory();
}, []);
  // Load items when itemType changes
  useEffect(() => {
    if (!formData.itemType) return;

    const loadItems = async () => {
      const res = await api.get("/items", { params: { type: formData.itemType } });
       api.get("/accounts").then(res => setAccounts(res.data));
      // setItems(res.data?.data || []);
      setItems(res.data || []);
    };

    loadItems();
  }, [formData.itemType]);

 const columns = [
  { key: "createdAt", header: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },

{ key: "item", header: "Item", render: (r) => r.item?.name || "-" },

{ key: "type", header: "Transaction", render: (r) => r.type },

{ key: "reference", header: "Reference", render: (r) => r.reference || "-" },

{ key: "quantity", header: "Qty", className: "text-right" },

{ key: "totalAmount", header: "Value", className: "text-right" },

{ key: "createdBy", header: "User", render: (r) => r.createdBy?.name || "System" },

];





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/inventory/in", {
  itemId: formData.itemId,
  quantity: Number(formData.quantity),
  unitCost: Number(formData.unitCost),
  debitAccount: formData.debitAccount,
  creditAccount: formData.creditAccount,
});


      setFormData({
        date: new Date().toISOString().split("T")[0],
        itemType: "",
        itemId: "",
        quantity: "",
        unitCost: "",
debitAccount: "",
creditAccount: "",
        reference: "",
        notes: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Stock In" subtitle="Record incoming inventory" icon={PackagePlus} />

      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-8">
        <h2 className="text-lg font-semibold mb-4">New Stock In Entry</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={formData.date} disabled />
          </div>

          <div className="space-y-2">
            <Label>Item Type</Label>
            <Select value={formData.itemType} onValueChange={(v) => setFormData({ ...formData, itemType: v, itemId: "" })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
<SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Item</Label>
            <Select value={formData.itemId} onValueChange={(v) => setFormData({ ...formData, itemId: v })}>
              <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item._id} value={item._id}>{item.name}
</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
          </div>

<div className="space-y-2">
  <Label>Unit Cost</Label>
  <Input
    type="number"
    value={formData.unitCost}
    onChange={(e) =>
      setFormData({ ...formData, unitCost: e.target.value })
    }
  />
</div>


<div className="space-y-2">
  <Label>Debit Account</Label>
  <Select
    value={formData.debitAccount}
    onValueChange={(v) =>
      setFormData({ ...formData, debitAccount: v })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select account" />
    </SelectTrigger>
    <SelectContent>
      {accounts.map(acc => (
        <SelectItem key={acc._id} value={acc._id}>
          {acc.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label>Credit Account</Label>
  <Select
    value={formData.creditAccount}
    onValueChange={(v) =>
      setFormData({ ...formData, creditAccount: v })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select account" />
    </SelectTrigger>
    <SelectContent>
      {accounts.map(acc => (
        <SelectItem key={acc._id} value={acc._id}>
          {acc.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


          <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Stock In
            </Button>
          </div>
        </form>
      </div>

      <DataTable columns={columns} data={recentTransactions} emptyMessage="No stock in data" />
    </div>
  );
}
