import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, unit, icon: Icon, description, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold">
            {value}
          </div>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {description && (
          <p className={`text-xs ${getTrendColor()} mt-1`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
