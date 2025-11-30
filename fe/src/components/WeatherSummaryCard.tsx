import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface WeatherMetric {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
}

interface WeatherSummaryCardProps {
  metrics: WeatherMetric[];
}

export const WeatherSummaryCard = ({ metrics }: WeatherSummaryCardProps) => {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Resumo Climático</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-xs text-muted-foreground text-center">{metric.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
