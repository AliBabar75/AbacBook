import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { Wallet } from "lucide-react";

export default function OpeningBalance() {

  const [capital, setCapital] = useState("");
  const [inventory, setInventory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capital || Number(capital) <= 0) {
      alert("Enter valid capital amount");
      return;
    }

    try {
      setLoading(true);

      await api.post("/opening-balance", {
        capitalAmount: Number(capital),
        inventoryAmount: Number(inventory || 0),
      });

      alert("Opening balance posted successfully");

      setCapital("");
      setInventory("");

    } catch (err: any) {
      alert(err.response?.data?.message || "Error posting opening balance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Opening Balance Setup"
        subtitle="Initial capital & inventory setup"
        icon={Wallet}
      />

      <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Opening Capital</Label>
            <Input
              type="number"
              placeholder="Enter capital amount"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Opening Inventory (Optional)</Label>
            <Input
              type="number"
              placeholder="Enter inventory value"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Posting..." : "Submit Opening Balance"}
          </Button>

        </form>
      </div>
    </div>
  );
}
