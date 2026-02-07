import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import ProtectedRoute from "@/services/ProtectedRoute";
// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RawMaterials from "@/pages/inventory/RawMaterials";
import FinishedGoods from "@/pages/inventory/FinishedGoods";
import StockIn from "@/pages/inventory/StockIn";
import StockOut from "@/pages/inventory/StockOut";
import Conversion from "@/pages/inventory/Conversion";
import PurchaseList from "@/pages/purchases/PurchaseList";
import NewPurchase from "@/pages/purchases/NewPurchase";
import SalesList from "@/pages/sales/SalesList";
import NewSale from "@/pages/sales/NewSale";
import Invoice from "@/pages/sales/Invoice";
import Customers from "@/pages/parties/Customers";
import Suppliers from "@/pages/parties/Suppliers";
import Ledger from "@/pages/parties/Ledger";
import TrialBalance from "@/pages/reports/TrialBalance";
import ProfitLoss from "@/pages/reports/ProfitLoss";
import BalanceSheet from "@/pages/reports/BalanceSheet";
import InventoryClosing from "@/pages/reports/InventoryClosing";
import AgingReports from "@/pages/reports/AgingReports";
import NotFound from "@/pages/NotFound";
import Shopify from "./pages/shopify";
  
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* 🔓 Public Route */}
          <Route path="/login" element={<Login />} />

          {/* 🔐 Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Inventory */}
              <Route path="/inventory/raw-materials" element={<RawMaterials />} />
              <Route path="/inventory/finished-goods" element={<FinishedGoods />} />
              <Route path="/inventory/stock-in" element={<StockIn />} />
              <Route path="/inventory/stock-out" element={<StockOut />} />
              <Route path="/inventory/conversion" element={<Conversion />} />
              <Route path="/shopify" element={<Shopify />} />
              {/* Purchases */}
              <Route path="/purchases" element={<PurchaseList />} />
              <Route path="/purchases/new" element={<NewPurchase />} />

              {/* Sales */}
              <Route path="/sales" element={<SalesList />} />
              <Route path="/sales/new" element={<NewSale />} />
              <Route path="/sales/:id/invoice" element={<Invoice />} />

              {/* Parties */}
              <Route path="/parties/customers" element={<Customers />} />
              <Route path="/parties/suppliers" element={<Suppliers />} />
              <Route path="/parties/ledger" element={<Ledger />} />

              {/* Reports */}
              <Route path="/reports/trial-balance" element={<TrialBalance />} />
              <Route path="/reports/profit-loss" element={<ProfitLoss />} />
              <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
              <Route path="/reports/inventory-closing" element={<InventoryClosing />} />
              <Route path="/reports/aging" element={<AgingReports />} />
            </Route>
          </Route>

          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
