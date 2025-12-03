import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Droplets } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getRainProbability } from "@/utils/rainProbability";
import {
  formatChartTime,
  type WeatherHistoryPoint,
} from "@/utils/weatherHistory";

const lightBlue = "#87CEFA";

export const RainProbabilityChart = ({
  data,
}: {
  data: WeatherHistoryPoint[];
}) => {
  const chartData = data.map((point) => {
    const rain = getRainProbability(point.raw.current_weather.weathercode);

    return {
      time: formatChartTime(point.createdAt),
      probability: rain.percentage,
      label: rain.description,
    };
  });

  return (
    <Card className="overflow-hidden border-border/50 from-card to-card/95">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>

          <div>
            <CardTitle className="text-xl">Probabilidade de Chuva</CardTitle>
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
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lightBlue} stopOpacity={0.35} />
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: lightBlue }}
              formatter={(value: number, _name, props: any) => [
                `${value}%`,
                props.payload.label,
              ]}
            />

            <Line
              type="monotone"
              dataKey="probability"
              stroke={lightBlue}
              strokeWidth={3}
              fill="url(#rainGradient)"
              dot={false}
              activeDot={{ r: 6, fill: lightBlue }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
