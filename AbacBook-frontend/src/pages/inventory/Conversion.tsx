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
import { ArrowRightLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import api from "@/services/api.js";
import { getRawMaterials } from "@/services/inventory.service";
interface Option {
  id: string;
  name: string;
}
interface Option {
  _id: string;
  name: string;
}
interface ConversionItem {
  id: string;
  rawMaterialId: string;
  quantity: string;
}

export default function Conversion() {
  const [loading, setLoading] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<Option[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<Option[]>([]);
  const [recentConversions, setRecentConversions] = useState<
    Record<string, unknown>[]
  >([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    finishedGoodId: "",
    outputQuantity: "",
    reference: "",
  });

  const [inputItems, setInputItems] = useState<ConversionItem[]>([
    { id: "1", rawMaterialId: "", quantity: "" },
  ]);

  useEffect(() => {
    const loadFinishedGoods = async () => {
      const res = await api.get("/inventory/finished-goods");
      setFinishedGoods(res.data.items);
    };

    loadFinishedGoods();
  }, []);

  // Load dropdown data
  useEffect(() => {
    const loadMasters = async () => {
      const [rmRes, fgRes] = await Promise.all([
        api.get("/inventory/raw-materials"),
        api.get("/inventory/finished-goods"),
      ]);

      setRawMaterials(rmRes.data?.items || rmRes.data || []);
      setFinishedGoods(fgRes.data?.items || fgRes.data || []);
    };

    const loadRecent = async () => {
      try {
        const res = await api.get("/inventory/conversion/history");
        setRecentConversions(res.data || []);
      } catch {
        setRecentConversions([]);
      }
    };

    loadMasters();
    loadRecent();
  }, []);


const columns = [
  {
    key: "createdAt",
    header: "Date",
    render: (r: any) =>
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-",
  },
  {
    key: "item",
    header: "Finished Goods",
    render: (r: any) => r.item?.name || "-",
  },
  {
    key: "reference",
    header: "Reference",
    render: (r: any) => r.reference || "-",
  },
  {
    key: "quantity",
    header: "Output Qty",
  },
  
  {
    key: "totalAmount",
    header: "Value",
  },
];


  const addInputItem = () => {
    setInputItems([
      ...inputItems,
      { id: Date.now().toString(), rawMaterialId: "", quantity: "" },
    ]);
  };

  const removeInputItem = (id: string) => {
    if (inputItems.length > 1)
      setInputItems(inputItems.filter((i) => i.id !== id));
  };

  const updateInputItem = (
    id: string,
    field: keyof ConversionItem,
    value: string,
  ) => {
    setInputItems(
      inputItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/inventory/conversion", {
        date: formData.date,
        finishedGoodId: formData.finishedGoodId,
        outputQuantity: Number(formData.outputQuantity),
        reference: formData.reference,
        inputItems: inputItems.map((i) => ({
          rawMaterialId: i.rawMaterialId,
          quantity: Number(i.quantity),
        })),
      });

      const recent = await api.get("/inventory/conversion/history");
      setRecentConversions(recent.data || []);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        finishedGoodId: "",
        outputQuantity: "",
        reference: "",
      });
      setInputItems([{ id: "1", rawMaterialId: "", quantity: "" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Conversion"
        subtitle="Convert raw materials to finished goods"
        icon={ArrowRightLeft}
      />

      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-8">
        <h2 className="text-lg font-semibold mb-4">New Conversion</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.date} disabled />
            </div>

            <div className="space-y-2">
              <Label>Output: Finished Good</Label>
              <Select
                value={formData.finishedGoodId}
                onValueChange={(v) =>
                  setFormData({ ...formData, finishedGoodId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {finishedGoods.map((fg) => (
                    <SelectItem key={fg._id} value={fg._id}>
                      {fg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output Quantity</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.outputQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, outputQuantity: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                placeholder="e.g., CONV-001"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Input: Raw Materials</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInputItem}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> Add Material
              </Button>
            </div>

            <div className="space-y-3">
              {inputItems.map((item, idx) => (
                <div key={item.id} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Material {idx + 1}
                    </Label>
                    <Select
                      value={item.rawMaterialId}
                      onValueChange={(v) =>
                        updateInputItem(item.id, "rawMaterialId", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select raw material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((rm) => (
                          <SelectItem key={rm.id} value={rm.id}>
                            {rm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateInputItem(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInputItem(item.id)}
                    disabled={inputItems.length === 1}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Process Conversion
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Conversions</h2>
        <DataTable
          columns={columns}
          data={recentConversions}
          emptyMessage="No recent conversions."
        />
      </div>
    </div>
  );
}
