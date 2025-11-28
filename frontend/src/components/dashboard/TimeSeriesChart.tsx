import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { type WeatherLog } from "@/services/api";

interface TimeSeriesChartProps {
  data: WeatherLog[];
  title: string;
  dataKey: keyof WeatherLog; // Garante que só passamos chaves válidas (temperature, humidity...)
  color: string;
  unit: string;
  gradientId: string; // ID único para o gradiente SVG não bugar quando tiver vários gráficos
}

export function TimeSeriesChart({ 
  data, 
  title, 
  dataKey, 
  color, 
  unit,
  gradientId 
}: TimeSeriesChartProps) {
  
  const formatTime = (isoString: string) => {
    return format(new Date(isoString), "HH:mm", { locale: ptBR });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm z-50">
          <p className="text-sm font-medium text-slate-700">
            {format(new Date(label), "dd/MM 'às' HH:mm")}
          </p>
          <p className="text-sm font-bold" style={{ color: color }}>
            {title}: {Number(payload[0].value).toFixed(1)}{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pb-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}${unit}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}