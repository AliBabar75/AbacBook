import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "sales" | "purchases" | "inventory" | "receivable" | "payable";
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "sales",
  loading = false,
}: StatCardProps) {
  const variantStyles = {
    sales: "stat-card-sales",
    purchases: "stat-card-purchases",
    inventory: "stat-card-inventory",
    receivable: "stat-card-receivable",
    payable: "stat-card-payable",
  };

  const iconColors = {
    sales: "text-primary",
    purchases: "text-accent",
    inventory: "text-warning",
    receivable: "text-success",
    payable: "text-destructive",
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg bg-background/50",
            iconColors[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
