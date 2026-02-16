import { useEffect, useState } from "react";
import api from "@/services/api.js";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";

export default function Ledger() {
  const [searchParams] = useSearchParams();
  const partyIdFromUrl = searchParams.get("party");
  const partyTypeFromUrl = searchParams.get("type");

  const [filters, setFilters] = useState({
    partyType: partyTypeFromUrl || "",
    partyId: partyIdFromUrl || "",
    startDate: "",
    endDate: new Date().toISOString().split("T")[0],
  });

  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  /* ===============================
     LOAD PARTIES (Customer/Supplier)
  =============================== */
  useEffect(() => {
    if (!filters.partyType) {
      setParties([]);
      return;
    }

    const loadParties = async () => {
      try {
        const res = await api.get(`/${filters.partyType}s`);

        // handle different response shapes safely
        if (Array.isArray(res.data)) {
          setParties(res.data);
        } else if (res.data.suppliers) {
          setParties(res.data.suppliers);
        } else if (res.data.customers) {
          setParties(res.data.customers);
        } else if (res.data.data) {
          setParties(res.data.data);
        } else {
          setParties([]);
        }
      } catch (err) {
        console.error(err);
        setParties([]);
      }
    };

    loadParties();
  }, [filters.partyType]);

  /* ===============================
     LOAD LEDGER DATA
  =============================== */
  useEffect(() => {
    if (!filters.partyId) {
      setTransactions([]);
      setOpeningBalance(0);
      setClosingBalance(0);
      return;
    }

    const fetchLedger = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/ledger/party/${filters.partyId}`, {
          params: {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        });

        setTransactions(res.data.transactions || []);
        setOpeningBalance(res.data.openingBalance || 0);
        setClosingBalance(res.data.closingBalance || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [filters.partyId, filters.startDate, filters.endDate]);

  /* ===============================
     TABLE COLUMNS
  =============================== */
  const columns = [
    {
      key: "date",
      header: "Date",
      render: (row: any) =>
        new Date(row.date).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
    { key: "particulars", header: "Particulars" },
    {
      key: "reference",
      header: "Reference",
      render: (row: any) => row.reference || "—",
    },
    { key: "debit", header: "Debit", className: "text-right" },
    { key: "credit", header: "Credit", className: "text-right" },
    { key: "balance", header: "Balance", className: "text-right" },
  ];

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="View party account transactions"
        icon={FileText}
      />

      {/* FILTER SECTION */}
      <div className="bg-card p-6 mb-6 rounded-xl border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Party Type */}
          <div>
            <Label>Party Type</Label>
            <Select
              value={filters.partyType}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  partyType: value,
                  partyId: "", // reset party when type changes
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Party */}
          <div>
            <Label>Party</Label>
            <Select
  value={filters.partyId}
  onValueChange={(value) =>
    setFilters((prev) => ({
      ...prev,
      partyId: value,
    }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select party" />
  </SelectTrigger>

  <SelectContent>
    {Array.isArray(parties) &&
      parties.map((party) => {
        const partyId = party._id || party.id;   // 🔥 HANDLE BOTH CASES
        return (
          <SelectItem key={partyId} value={partyId}>
            {party.name}
          </SelectItem>
        );
      })}
  </SelectContent>
</Select>

          </div>

          {/* From Date */}
          <div>
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>

          {/* To Date */}
          <div>
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>

          {/* Print */}
          <div className="flex items-end">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-xl border">
          <p>Opening Balance</p>
          <p className="font-bold">{openingBalance.toFixed(2)}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <p>Total Transactions</p>
          <p className="font-bold">{transactions.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <p>Closing Balance</p>
          <p className="font-bold">{closingBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="Select a party to view ledger."
      />
    </div>
  );
}
