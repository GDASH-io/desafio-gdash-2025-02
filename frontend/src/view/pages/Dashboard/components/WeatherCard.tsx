import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
}

export const WeatherCard = ({
  title,
  value,
  unit,
  icon: Icon,
  description,
}: WeatherCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 bg-amber-100 from-card to-card/95">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl  from-primary/20 to-secondary/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xl font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
