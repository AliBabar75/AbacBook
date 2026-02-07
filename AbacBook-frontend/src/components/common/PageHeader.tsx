import { Button } from "@/components/ui/button";
import { LucideIcon, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <ActionIcon className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
