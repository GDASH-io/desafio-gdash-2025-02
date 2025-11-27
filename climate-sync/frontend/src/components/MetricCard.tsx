import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: "primary" | "accent" | "warning";
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, gradient = "primary", subtitle }: MetricCardProps) {
  const gradientClass = `bg-gradient-${gradient}`;
  
  return (
    <Card className="p-4 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border-border/50">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</h3>
            {subtitle && <span className="text-xs sm:text-sm text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${gradientClass}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
