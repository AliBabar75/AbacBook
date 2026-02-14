import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  CreditCard,
  Wallet,
} from "lucide-react";


import { useEffect, useState } from "react";
import api from "@/services/api.js"

export default function Dashboard() {
  
const [loading, setLoading] = useState(true);

const [stats, setStats] = useState<any>({});

const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

useEffect(() => {
  async function load() {
    try {
      const response = await api.get("/dashboard");   // 🔥 small g
      const data = response.data;                     // 🔥 axios structure

      setStats(data.stats || {});
      setRecentTransactions(data.recentTransactions || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  load();
}, []);


  const transactionColumns = [
    { key: "date", header: "Date" },
    { key: "type", header: "Type" },
    { key: "party", header: "Party" },
    { key: "amount", header: "Amount", className: "text-right" },
  ];

  return (
    <div>
  
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your business performance"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {/* DATA COMES FROM CLIENT BACKEND API */}
        <StatCard
          title="Total Sales"
         value={stats.totalSales ?? 0}
          subtitle="This month"
          icon={TrendingUp}
          variant="sales"
          loading={loading}
        />
        <StatCard
          title="Total Purchases"
          value={stats.totalPurchases ?? 0}
          subtitle="This month"
          icon={ShoppingCart}
          variant="purchases"
          loading={loading}
        />
        <StatCard
          title="Inventory Value"
          value={stats.inventoryValue ?? 0}
          subtitle="Current stock"
          icon={Package}
          variant="inventory"
          loading={loading}
        />
        <StatCard
          title="Accounts Receivable"
          value={stats.receivable ?? 0}
          subtitle="Outstanding"
          icon={CreditCard}
          variant="receivable"
          loading={loading}
        />
        <StatCard
          title="Accounts Payable"
          value={stats.payable ?? 0}
          subtitle="Outstanding"
          icon={Wallet}
          variant="payable"
          loading={loading}
        />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
        {/* DATA COMES FROM CLIENT BACKEND API */}
        <DataTable
          columns={transactionColumns}
          data={recentTransactions}
          loading={loading}
          emptyMessage="No recent transactions. Data will be loaded from the backend API."
        />
      </div>
    </div>
  );
}
