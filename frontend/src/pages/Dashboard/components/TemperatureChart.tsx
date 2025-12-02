import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeatherDataLog } from "@/types/weatherType";

interface Props {
  data: WeatherDataLog[];
}

export function TemperatureChart({ data }: Props) {
  // 1. Prepara os dados:

  const chartData = [...data].reverse().map((log) => ({
    time: new Date(log.collected_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: log.temperature,
    humidity: log.humidity,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-700">
          Tendência de Temperatura (°C)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Usado AreaChart  com preenchimento embaixo */}
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

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
                minTickGap={30} // Evita que os horários fiquem um em cima do outro
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
                domain={["auto", "auto"]} // O gráfico se ajusta à escala dos dados (não começa do 0 obrigatoriamente)
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
                labelStyle={{ color: "#64748b", marginBottom: "0.5rem" }}
              />

              <Area
                type="monotone"
                dataKey="temp"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTemp)"
                name="Temperatura"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
