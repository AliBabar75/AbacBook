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

/**
 * Dashboard - Main Overview
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoints:
 * - GET /api/dashboard/summary - Returns totals for sales, purchases, inventory, etc.
 * - GET /api/dashboard/recent-transactions - Returns recent transaction list
 */
export default function Dashboard() {
  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch dashboard summary from API
  // const { data: summary, loading } = useFetch('/api/dashboard/summary');
  const loading = false;

  // DATA COMES FROM CLIENT BACKEND API
  // TODO: Fetch recent transactions from API
  // const { data: transactions } = useFetch('/api/dashboard/recent-transactions');
  const recentTransactions: Record<string, unknown>[] = [];

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
          value="—"
          subtitle="This month"
          icon={TrendingUp}
          variant="sales"
          loading={loading}
        />
        <StatCard
          title="Total Purchases"
          value="—"
          subtitle="This month"
          icon={ShoppingCart}
          variant="purchases"
          loading={loading}
        />
        <StatCard
          title="Inventory Value"
          value="—"
          subtitle="Current stock"
          icon={Package}
          variant="inventory"
          loading={loading}
        />
        <StatCard
          title="Accounts Receivable"
          value="—"
          subtitle="Outstanding"
          icon={CreditCard}
          variant="receivable"
          loading={loading}
        />
        <StatCard
          title="Accounts Payable"
          value="—"
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
