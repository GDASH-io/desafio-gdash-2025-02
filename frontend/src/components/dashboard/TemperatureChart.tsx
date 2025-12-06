import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  time: string;
  temperatura: number;
  sensacao: number;
}

interface TemperatureChartProps {
  data: ChartDataPoint[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-orange-500" />
          Temperatura ao Longo do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="line" />
              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 4 }}
                name="Temperatura"
              />
              <Line
                type="monotone"
                dataKey="sensacao"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#f97316", r: 4 }}
                name="Sensação"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}

