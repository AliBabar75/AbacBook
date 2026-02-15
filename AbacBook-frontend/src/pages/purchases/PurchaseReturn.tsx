import { useEffect, useState } from "react";
import { PHeader, DataTablePlaceholder } from "@/components/common/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import api from "@/services/api.js";

export default function PurchaseReturn() {
  const [open, setOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");

  const [returns, setReturns] = useState<any[]>([]);

  // Load Purchases
  useEffect(() => {
    api.get("/purchases")
      .then(res => setPurchases(res.data.items || []))
      .catch(err => console.error(err));
  }, []);

  // Load Returns
  const loadReturns = async () => {
    const res = await api.get("/purchase-returns");
    setReturns(res.data || []);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Select Purchase
  const handlePurchaseSelect = async (id: string) => {
    const res = await api.get(`/purchases/${id}`);
    const purchase = res.data;

    setSelectedPurchase(purchase);

    const mapped = purchase.items.map((item: any) => ({
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

  // Submit Return
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedPurchase) return alert("Select purchase first");

    const items = returnItems
      .filter(i => i.qty > 0)
      .map(i => ({
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

      alert("Purchase Return Created ✅");

      setSelectedPurchase(null);
      setReturnItems([]);
      setNotes("");
      setDate("");
      setOpen(false);

      await loadReturns();
    } catch (err) {
      console.error(err);
      alert("Return failed");
    } finally {
      setLoading(false);
    }
  };

  // Refund Logic
  const handleRefund = async () => {
    if (!selectedReturn) return;

    try {
      await api.post("/purchases/refund", {
        purchaseId: selectedReturn.purchaseId?._id,
        amount: Number(refundAmount),
        paymentMethod: refundMethod,
        date: new Date().toISOString(),
      });

      alert("Supplier Cash Refund Received ✅");

      setRefundOpen(false);
      setRefundAmount("");
      setSelectedReturn(null);

      await loadReturns();
    } catch (err) {
      console.error(err);
      alert("Refund failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <PHeader
        title="Purchase Returns"
        description="View and record purchase returns to suppliers"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Return
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Purchase Return</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Original Purchase Invoice</Label>
                    <select onChange={e => handlePurchaseSelect(e.target.value)}>
                      <option>Select Purchase</option>
                      {purchases.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.invoiceNo}
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

                <div className="space-y-2">
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

                <Button type="submit" className="w-full">
                  Submit Return
                </Button>
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
          "Total",
          "Actions",
        ]}
        data={returns.map(r => {
          const purchase = r.purchaseId;
          if (!purchase) return {};

          const totalAmount = purchase.totalAmount || 0;
          const totalReturned = purchase.totalReturned || 0;
          const totalPaid = purchase.totalPaid || 0;

          const netPurchase = totalAmount - totalReturned;
          const refundable = totalPaid > netPurchase;
          const refundAmt = refundable ? totalPaid - netPurchase : 0;

          return {
            returnNo: r.returnNo,
            date: new Date(r.date).toLocaleDateString(),
            invoice: purchase.invoiceNo || "-",
            supplier: purchase.supplierId?.name || "-",
            qty: r.items?.reduce((sum: number, i: any) => sum + i.quantity, 0),
            total: r.totalAmount,
            actions: refundable ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReturn(r);
                  setRefundAmount(refundAmt.toString());
                  setRefundOpen(true);
                }}
              >
                Receive {refundAmt}
              </Button>
            ) : (
              <Badge variant="secondary">Cash Settled</Badge>
            ),
          };
        })}
        emptyMessage="No Purchase Returns Found"
      />

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supplier Cash Refund Received</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="number"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
            />

            <select
              className="w-full border rounded p-2"
              value={refundMethod}
              onChange={e => setRefundMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>

            <Button className="w-full" onClick={handleRefund}>
              Confirm Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
