import { useEffect, useState } from "react";
import { PHeader, DataTablePlaceholder } from "@/components/common/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import api from "@/services/api.js";

export default function PurchaseReturn() {
  const [open, setOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // purchase list
useEffect(() => {
    api.get("/purchases")
      .then(res => setPurchases(res.data.items || []))
      .catch(err => console.error(err));
  }, []);

  
  
  // select purchase and fetch details
  const handlePurchaseSelect = async (id) => {
    const res = await api.get(`/purchases/${id}`);
    const purchase = res.data;

    setSelectedPurchase(purchase);

    const mapped = purchase.items.map(item => ({
      itemId: item.rawMaterialId._id,
      name: item.rawMaterialId.name,
      maxQty: item.quantity,
      qty: 0,
      rate: item.rate,
      reason: "",
      amount: 0,
    }));

    setReturnItems(mapped);
  };

  const updateItem = (index, field, value) => {
    const copy = [...returnItems];
    if (field === "qty") {
      const qty = Math.min(value, copy[index].maxQty);
      copy[index].qty = qty;
      copy[index].amount = qty * copy[index].rate;
    } else {
      copy[index][field] = value;
    }
    setReturnItems(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPurchase) return alert("Select purchase first");
    const items = returnItems.filter(i => i.qty > 0).map(i => ({
      itemId: i.itemId,
      quantity: i.qty,
      reason: i.reason,
      amount: i.amount,
    }));
    if (items.length === 0) return alert("Return qty missing");

    try {
      setLoading(true);
      await api.post("/purchase-returns", {
        purchaseId: selectedPurchase._id,
        date,
        notes,
        items,
      });
      alert("Purchase Return Created ✅ ");
      setSelectedPurchase(null);
      setReturnItems([]);
      setNotes("");
      setDate("");
    } catch (err) {
      console.error(err);
      alert("Return failed");
    } finally {
      setLoading(false);
    }
// load purchase list

};

  const [returns, setReturns] = useState([]);

useEffect(() => {
  api.get("/purchase-returns")
    .then(res => setReturns(res.data || []))
    .catch(err => console.error(err));
}, []);

  return (
    <div className="animate-fade-in">
      <PHeader
        title="Purchase Returns"
        description="View and record purchase returns to suppliers"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Return</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New Purchase Return</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Original Purchase Invoice</Label>
                    <select onChange={e => handlePurchaseSelect(e.target.value)}>
                      <option>Select Purchase</option>
                      {purchases.map(p => (
                        <option key={p.id} value={p.id}>{p.invoiceNo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Return Date</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Return Items</h3>
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    {returnItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <Input value={item.name} disabled />
                        <Input type="number" value={item.qty} max={item.maxQty} onChange={e => updateItem(index, "qty", Number(e.target.value))} />
                        <Input placeholder="Reason" value={item.reason} onChange={e => updateItem(index, "reason", e.target.value)} />
                        <Input value={item.amount} disabled />
                      </div>
                    ))}
                    {returnItems.length === 0 && <p className="text-sm text-muted-foreground">Select purchase to load items</p>}
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Input placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>Submit Return</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
<DataTablePlaceholder
  columns={[
    "Return No",
    "Date",
    "Original Invoice",
    "Supplier",
    "Qty",
    "Reason",
    "Total Amount",
    "Status",
    "Actions",
  ]}
  data={returns.map(r => ({
    returnNo: r.returnNo,
    date: new Date(r.date).toLocaleDateString(),
    invoice: r.purchaseId?.invoiceNo || "-",
    supplier: r.purchaseId?.supplierId?.name || "-",
    qty: r.items?.reduce((sum, i) => sum + i.quantity, 0),
    reason: r.items?.map(i => i.reason).join(", "),
    total: r.totalAmount,
    status: r.status,
    actions: "done"
  }))}
  emptyMessage="No Purchase Returns Found"
/>
    </div>
  );
}

// columns={["Return No", "Date", "Original Invoice", "Supplier", "Total Amount", "Reason", "Status", "Actions"]}
// "Supplier","Reason", "Status", "Actions" "qty "
