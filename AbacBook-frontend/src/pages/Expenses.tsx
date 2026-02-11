import { useState } from "react";
import { PHeader, DataTablePlaceholder } from "@/components/common/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// GET /api/expenses
// Expected: [{ id, date, category, description, amount, paidTo, paymentMethod, reference }]

export default function Expenses() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Expense submitted");
  };

  return (
    <div className="animate-fade-in">
      <PHeader
        title="Expenses"
        description="Track and manage business expenses"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input placeholder="Select category (API)" />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input placeholder="Expense description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Paid To</Label>
                    <Input placeholder="Payee name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Method</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Card</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <Label>Reference</Label>
                    <Input placeholder="e.g. EXP-001" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Submit Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTablePlaceholder
        columns={["Date", "Category", "Description", "Amount", "Paid To", "Payment Method", "Reference"]}
        emptyMessage="Connect API: GET /api/expenses"
      />
    </div>
  );
}
