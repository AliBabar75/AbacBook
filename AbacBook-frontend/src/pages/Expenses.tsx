import { useState, useEffect } from "react";
import { PHeader, DataTablePlaceholder } from "@/components/common/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/services/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState({
    date: "",
    category: "",
    description: "",
    amount: "",
    paidTo: "",
    paymentMethod: "Cash",
    reference: "",
  });

  const loadExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await api.post("/expenses", {
      ...form,
      amount: Number(form.amount),
    });

    setForm({
      date: "",
      category: "",
      description: "",
      amount: "",
      paidTo: "",
      paymentMethod: "Cash",
      reference: "",
    });

    loadExpenses();
  };

  return (
    <div>
      <PHeader
        title="Expenses"
        description="Track and manage business expenses"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Expense</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full h-10 rounded-md border px-3"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Salaries & Wages">Salaries & Wages</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other Expenses">Other Expenses</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Paid To</Label>
                    <Input
                      value={form.paidTo}
                      onChange={(e) =>
                        setForm({ ...form, paidTo: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Method</Label>
                    <select
                      className="w-full h-10 rounded-md border px-3"
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({ ...form, paymentMethod: e.target.value })
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <Label>Reference</Label>
                    <Input
                      value={form.reference}
                      onChange={(e) =>
                        setForm({ ...form, reference: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Expense
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-4 mt-6">
        <DataTablePlaceholder
          columns={[
            "Date",
            "Category",
            "Description",
            "Amount",
            "Paid To",
            "Payment Method",
            "Reference",
          ]}
          data={expenses}
        />
      </Card>
    </div>
  );
}
