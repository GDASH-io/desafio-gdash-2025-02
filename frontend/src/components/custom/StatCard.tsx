import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, unit, subtitle, icon: Icon, iconColor = "text-slate-100" }: StatCardProps) {
  return (
    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 text-slate-100 shadow-xl hover:bg-slate-900/70 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {value}
          <span className="text-lg text-slate-500 ml-1 font-normal">{unit}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}