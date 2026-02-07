import { useState } from "react";
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
import { Receipt, Save, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

/**
 * New Sale - Sales Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoints:
 * - GET /api/parties/customers - List customers for selection
 * - GET /api/inventory/finished-goods - List items for sale
 * - POST /api/sales - Submit sale
 * 
 * Sale submission handled by backend accounting engine.
 * Do NOT calculate profit or COGS in UI.
 */

interface SaleItem {
  id: string;
  itemId: string;
  quantity: string;
  rate: string;
}

export default function NewSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    invoiceNo: "",
    customerId: "",
    paymentTerms: "",
    notes: "",
  });
  const [items, setItems] = useState<SaleItem[]>([
    { id: "1", itemId: "", quantity: "", rate: "" },
  ]);

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch customers from API
  // const { data: customers } = useFetch('/api/parties/customers');
  const customers: { id: string; name: string }[] = [];

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch finished goods from API
  // const { data: finishedGoods } = useFetch('/api/inventory/finished-goods');
  const finishedGoods: { id: string; name: string }[] = [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // DATA COMES FROM CLIENT BACKEND API
      // Sale submission handled by backend accounting engine
      // Do NOT calculate profit or COGS here
      // TODO: Replace with actual API call
      // await fetch('/api/sales', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, items }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/sales");
    } catch (error) {
      console.error("Sale creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
        {/* Header Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Sale Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="form-input-focus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNo">Invoice No.</Label>
              <Input
                id="invoiceNo"
                placeholder="e.g., INV-001"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                required
                className="form-input-focus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              {/* DATA COMES FROM CLIENT BACKEND API */}
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              >
                <SelectTrigger className="form-input-focus">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                  {customers.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground">
                      Customers loaded from API
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
              >
                <SelectTrigger className="form-input-focus">
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

        {/* Items Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          <div className="space-y-4 mt-4">
            {items.map((item, index) => {
              const amount = Number(item.quantity || 0) * Number(item.rate || 0);
              return (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5 space-y-2">
                    <Label className="md:hidden">Item {index + 1}</Label>
                    {/* DATA COMES FROM CLIENT BACKEND API */}
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => updateItem(item.id, "itemId", value)}
                    >
                      <SelectTrigger className="form-input-focus">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {finishedGoods.map((fg) => (
                          <SelectItem key={fg.id} value={fg.id}>
                            {fg.name}
                          </SelectItem>
                        ))}
                        {finishedGoods.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground">
                            Products loaded from API
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      className="form-input-focus text-right"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Rate</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                      className="form-input-focus text-right"
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
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this sale..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input-focus min-h-[100px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
