import { useEffect, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";

export default function MdSecretPanel() {

  const [data, setData] = useState<any>({});
  const [active, setActive] = useState("purchases");

  const load = async () => {
    const res = await api.get("/md-secret/dump");
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (collection: string, id: string) => {
    await api.delete(`/md-secret/${collection}/${id}`);
    load();
  };

  if (!data[active]) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔒 MD Secret Panel</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(data).map((key) => (
          <Button
            key={key}
            variant={active === key ? "default" : "outline"}
            onClick={() => setActive(key)}
          >
            {key}
          </Button>
        ))}
      </div>

      <div className="border rounded p-4 overflow-auto max-h-[500px]">
        {data[active].map((row: any) => (
          <div
            key={row._id}
            className="border-b py-2 flex justify-between items-center"
          >
            <pre className="text-xs w-[80%] overflow-x-auto">
              {JSON.stringify(row, null, 2)}
            </pre>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(active, row._id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
