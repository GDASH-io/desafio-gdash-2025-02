import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type WeatherHistoryPoint,
  formatChartTime,
} from "@/utils/weatherHistory";

import { Thermometer } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TemperatureChartProps {
  data: WeatherHistoryPoint[];
}

export const TemperatureChart = ({ data }: TemperatureChartProps) => {
  const chartData = data.map((point) => ({
    time: formatChartTime(point.createdAt),
    temperatura: Number(point.temperatureC.toFixed(1)),
  }));

  return (
    <Card className="overflow-hidden border-border/50 from-card to-card/95">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200/50 from-primary/20 to-secondary/20 flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Histórico de Temperatura</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}°C`}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "hsl(var(--primary))" }}
              formatter={(value: number) => [`${value}°C`, "Temperatura"]}
            />
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#FFD95A"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
