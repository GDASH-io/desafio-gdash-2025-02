import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react"; // Ícone para dar um charme
import type { WeatherDataLog } from "@/types/weatherType";

interface Props {
  data: WeatherDataLog[];
}

export function HumidityChart({ data }: Props) {
  // Processa dados (inverte ordem para cronológico)
  const chartData = [...data].reverse().map((log) => ({
    time: new Date(log.collected_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    humidity: log.humidity,
  }));

  return (
    <Card className="shadow-sm h-full border-zinc-200">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Droplets className="h-4 w-4 text-blue-500" />
        </div>
        <CardTitle className="text-lg text-zinc-700">
          Umidade Relativa (%)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]} // Trava o eixo em 0-100%
              />
              <Tooltip
                cursor={{ fill: "#eff6ff" }} // Highlight azul claro ao passar o mouse
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                formatter={(value: number) => [`${value}%`, "Umidade"]}
              />
              <Bar
                dataKey="humidity"
                fill="#3b82f6" // Azul
                radius={[4, 4, 0, 0]} // Arredonda o topo das barras
                fillOpacity={0.8}
                activeBar={{ fill: "#2563eb" }} // Azul mais escuro no hover
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
