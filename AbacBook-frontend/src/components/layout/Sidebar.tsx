import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Boxes,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  ClipboardList,
  Clock,
  Undo2,
  Wallet,
  Wallet2,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from "../../components/common/ThemeToggle";

interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: { label: string; path: string; icon: React.ElementType }[];
}

const navigation: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Raw Materials", path: "/inventory/raw-materials", icon: Boxes },
      { label: "Finished Goods", path: "/inventory/finished-goods", icon: Package },
      { label: "Stock In", path: "/inventory/stock-in", icon: PackagePlus },
      { label: "Stock Out", path: "/inventory/stock-out", icon: PackageMinus },
      { label: "Conversion", path: "/inventory/conversion", icon: ArrowRightLeft },
    ],
  },
  {
    label: "Purchases",
    icon: ShoppingCart,
    children: [
      { label: "Purchase List", path: "/purchases", icon: ClipboardList },
      { label: "New Purchase", path: "/purchases/new", icon: ShoppingCart },
      { label: "Purchase Return", path: "/purchases/return", icon: Undo2 },
      { label: "Opening Balance", path: "openingbalance", icon: Undo2 },
    ],
  },
  {
    label: "Sales",
    icon: Receipt,
    children: [
      { label: "Sales List", path: "/sales", icon: ClipboardList },
      { label: "New Sale", path: "/sales/new", icon: Receipt },
      { label: "Sales Return", path: "/sales/return", icon: Undo2 },
    ],
  },
  {
    label: "Expenses",
    icon: Wallet2,
    children: [
      { label: "Expenses", path: "/expenses", icon: Wallet },

    ]},
  {
    label: "Parties",
    icon: Users,
    children: [
      { label: "Customers", path: "/parties/customers", icon: Users },
      { label: "Suppliers", path: "/parties/suppliers", icon: Users },
      { label: "Ledger", path: "/parties/ledger", icon: FileText },
    ],
  },
  {
    label: "Reports",
    icon: FileText,
    children: [
      { label: "Trial Balance", path: "/reports/trial-balance", icon: Scale },
      { label: "Profit & Loss", path: "/reports/profit-loss", icon: TrendingUp },
      { label: "Balance Sheet", path: "/reports/balance-sheet", icon: FileSpreadsheet },
      { label: "Inventory Closing", path: "/reports/inventory-closing", icon: Package },
      { label: "Aging Reports", path: "/reports/aging", icon: Clock },
    ],
  },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Inventory", "Purchases", "Sales", "Parties", "Reports"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
const { isDark, toggle } = useTheme();
  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some((child) => location.pathname === child.path);

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.label}>
          
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              "nav-link w-full justify-between",
              isParentActive(item.children) && "text-sidebar-accent-foreground"
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
              {item.children?.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "nav-link text-sm",
                      isActive(child.path) && "nav-link-active"
                    )}
                  >
                    <ChildIcon className="h-4 w-4" />
                    <span>{child.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        onClick={() => setIsMobileOpen(false)}
        className={cn("nav-link", isActive(item.path!) && "nav-link-active")}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}

      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg text-sidebar-foreground"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
      id="SB"
      // bg-sidebar
        className={ cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-accent-foreground" />
              
            </div>
            <span className="text-xl font-bold text-sidebar-primary">AbacBook</span>
        <ThemeToggle />
       
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map(renderNavItem)}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            className="nav-link w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
