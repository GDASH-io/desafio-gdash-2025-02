import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind } from "lucide-react";
import type { WeatherDataLog } from "@/types/weatherType";

interface Props {
  data: WeatherDataLog[];
}

export function WindChart({ data }: Props) {
  // Processa dados (inverte ordem para cronológico)
  const chartData = [...data].reverse().map((log) => ({
    time: new Date(log.collected_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    wind: log.wind_speed,
  }));

  return (
    <Card className="shadow-sm h-full border-zinc-200">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Wind className="h-4 w-4 text-slate-600" />
        </div>
        <CardTitle className="text-lg text-zinc-700">
          Velocidade do Vento (km/h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, "auto"]}
              />
              <Tooltip
                cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#475569", fontWeight: "bold" }}
                formatter={(value: number) => [`${value} km/h`, "Vento"]}
              />
              <Line
                type="monotone"
                dataKey="wind"
                stroke="#475569" // Slate-600
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#475569" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
