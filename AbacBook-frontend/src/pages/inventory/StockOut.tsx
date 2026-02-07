import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageMinus, Save, Loader2 } from "lucide-react";
import api from "../../services/api.js";

interface Item {
  _id: string;
  name: string;
}

export default function StockOut() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    itemType: "",
    itemId: "",
    quantity: "",
    debitAccount: "",
    creditAccount: "",
  });

  // 🔹 Load history
  // const loadHistory = async () => {
  //   const res = await api.get("/inventory/history");
  //   setRecentTransactions(res.data);
  // };
const loadHistory = async () => {
  const res = await api.get("/inventory/history");
  const onlyOut = res.data.filter(
    (row) => row.type === "OUT"
  );
  setRecentTransactions(onlyOut);
};


  useEffect(() => {
    loadHistory();
  }, []);

  // 🔹 Load items + accounts
  useEffect(() => {
    if (!formData.itemType) return;

    const loadData = async () => {
      const itemsRes = await api.get("/items", {
        params: { type: formData.itemType },
      });
      const accRes = await api.get("/accounts");

      setItems(itemsRes.data || []);
      setAccounts(accRes.data || []);
    };

    loadData();
  }, [formData.itemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/inventory/out", {
        itemId: formData.itemId,
        quantity: Number(formData.quantity),
        debitAccount: formData.debitAccount,
        creditAccount: formData.creditAccount,
      });

      await loadHistory();

      setFormData({
        date: new Date().toISOString().split("T")[0],
        itemType: "",
        itemId: "",
        quantity: "",
        debitAccount: "",
        creditAccount: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "item",
      header: "Item",
      render: (row) => row.item?.name,
    },
    {
      key: "quantity",
      header: "Quantity",
    },
    {
      key: "reference",
      header: "Reference",
       render: (row) => row.reference || "—",
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (row) => row.createdBy?.name || "System",
    },
    {
  key: "finishedGood",
  header: "Finished Good",
  render: (row) => row.finishedGood?.name || "-",
},
  ];

  return (
    <div>
      <PageHeader
        title="Stock Out"
        subtitle="Record outgoing inventory"
        icon={PackageMinus}
      />

      <div className="bg-card rounded-xl border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">New Stock Out Entry</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <Label>Date</Label>
            <Input type="date" value={formData.date} disabled />
          </div>

          <div>
            <Label>Item Type</Label>
            <Select
              value={formData.itemType}
              onValueChange={(v) =>
                setFormData({ ...formData, itemType: v, itemId: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Item</Label>
            <Select
              value={formData.itemId}
              onValueChange={(v) =>
                setFormData({ ...formData, itemId: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i._id} value={i._id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Debit Account (COGS)</Label>
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
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Credit Account (Inventory)</Label>
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
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <Button disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Save />}
              Save Stock Out
            </Button>
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={recentTransactions}
        emptyMessage="No stock out data"
      />
    </div>
  );
}
