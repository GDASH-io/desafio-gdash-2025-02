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

import { Wind } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WindChartProps {
  data: WeatherHistoryPoint[];
}

export const WindChart = ({ data }: WindChartProps) => {
  const chartData = data.map((point) => ({
    time: formatChartTime(point.createdAt),
    vento: Number(point.windSpeedMs.toFixed(1)),
  }));
  const lightBlue = "#6effc7";

  return (
    <Card className="overflow-hidden border-border/50  from-card to-card/95">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6effc7]/40 from-secondary/20 to-accent/20 flex items-center justify-center">
            <Wind className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-xl">Histórico de Vento</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lightBlue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lightBlue} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `${value} km/h`}
              domain={[0, "dataMax + 3"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "hsl(var(--secondary))" }}
              formatter={(value: number) => [`${value} km/h`, "Velocidade"]}
            />
            <Area
              type="monotone"
              dataKey="vento"
              stroke={lightBlue}
              strokeWidth={3}
              fill="url(#windGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
