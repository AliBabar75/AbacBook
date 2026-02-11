import { useEffect, useState } from "react";
import { PHeader, DataTablePlaceholder } from "@/components/common/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import api from "@/services/api";

export default function SalesReturn() {
  const [open, setOpen] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Load Sales
  useEffect(() => {
    api.get("/sales")
      .then(res => setSales(res.data || []))
      .catch(err => console.error(err));
  }, []);

  // 🔥 Load History
  useEffect(() => {
    api.get("/sales-returns")
      .then(res => setReturns(res.data || []))
      .catch(err => console.error(err));
  }, []);

  // 🔥 Select Sale
  const handleSaleSelect = async (id: string) => {
    const res = await api.get(`/sales`);
    const sale = res.data.find((s: any) => s._id === id);

    setSelectedSale(sale);

    const mapped = sale.items.map((item: any) => ({
      itemId: item.itemId._id,
      name: item.itemId.name,
      maxQty: item.quantity,
      qty: 0,
      rate: item.rate,
      reason: "",
      amount: 0,
    }));

    setReturnItems(mapped);
  };

  const updateItem = (index: number, field: string, value: any) => {
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

  // 🔥 Submit Return
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedSale) return alert("Select sale first");

    const items = returnItems
      .filter(i => i.qty > 0)
      .map(i => ({
        itemId: i.itemId,
        quantity: i.qty,
        reason: i.reason,
      }));

    if (items.length === 0) return alert("Return qty missing");

    try {
      setLoading(true);

      await api.post("/sales-returns", {
        saleId: selectedSale._id,
        date,
        notes,
        items,
      });

      alert("Sales Return Created ✅");

      setOpen(false);
      setSelectedSale(null);
      setReturnItems([]);
      setDate("");
      setNotes("");

      // reload history
      const res = await api.get("/sales-returns");
      setReturns(res.data || []);

    } catch (err) {
      console.error(err);
      alert("Return failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PHeader
        title="Sales Returns"
        description="View and record sales returns from customers"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Return
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Sales Return</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Original Sale Invoice</Label>
                    <select
                      className="w-full border rounded p-2"
                      onChange={e => handleSaleSelect(e.target.value)}
                    >
                      <option>Select Sale</option>
                      {sales.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.invoiceNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Return Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Return Items</h3>

                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    {returnItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <Input value={item.name} disabled />

                        <Input
                          type="number"
                          value={item.qty}
                          max={item.maxQty}
                          onChange={e =>
                            updateItem(index, "qty", Number(e.target.value))
                          }
                        />

                        <Input
                          placeholder="Reason"
                          value={item.reason}
                          onChange={e =>
                            updateItem(index, "reason", e.target.value)
                          }
                        />

                        <Input value={item.amount} disabled />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Submit Return
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* 🔥 HISTORY TABLE */}
      <DataTablePlaceholder
        columns={[
          "Return No",
          "Date",
          "Original Invoice",
          "Customer",
          "Qty",
          "Reason",
          "Total Amount",
          "Status",
          "Actions",
        ]}
        data={returns.map(r => ({
          returnNo: r.returnNo,
          date: new Date(r.date).toLocaleDateString(),
          invoice: r.saleId?.invoiceNo || "-",
          customer: r.customerId?.name || "-",
          qty: r.items?.reduce((sum: number, i: any) => sum + i.quantity, 0),
          reason: r.items?.map((i: any) => i.reason).join(", "),
          total: r.totalAmount,
          status: r.status,
          actions: "—",
        }))}
        emptyMessage="No Sales Returns Found"
      />
    </div>
  );
}
