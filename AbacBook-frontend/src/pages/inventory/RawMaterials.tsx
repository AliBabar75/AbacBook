import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Boxes, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { getRawMaterials } from "@/services/inventory.service";
import AddRawMaterial from "@/pages/inventory/AddRawMaterial";

export default function RawMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    getRawMaterials()
      .then(setMaterials)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const columns = [
   { key: "code", header: "Item Code" },
  { key: "name", header: "Name" },
  { key: "type", header: "Type" }, 
  { key: "unit", header: "Unit" },
  { key: "quantity", header: "Quantity", className: "text-right" },
  { key: "avgCost", header: "Avg. Cost", className: "text-right" },
   { key: "value", header: "Value", className: "text-right" },
  ];

  return (
    <div>
      <PageHeader
        title="Raw Materials"
        subtitle="Manage raw material inventory"
        icon={Boxes}
        actionLabel="Add Material"
        onAction={() => setShowAdd(true)}
      />

      {showAdd && (
        <AddRawMaterial
          onSuccess={() => {
            setShowAdd(false);
            reload();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      

      <DataTable
        columns={columns}
        data={materials}
        loading={loading}
        emptyMessage="No raw materials found."
      />
    </div>
  );
}
