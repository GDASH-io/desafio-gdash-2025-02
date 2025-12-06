import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PrecipitationDataPoint {
  time: string;
  probabilidade: number;
}

interface PrecipitationChartProps {
  data: PrecipitationDataPoint[];
}

export function PrecipitationChart({ data }: PrecipitationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          Probabilidade de Chuva
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="colorProbabilidade"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#3b82f6"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3b82f6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis
                label={{ value: "%", angle: -90, position: "insideLeft" }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="square" />
              <Area
                type="monotone"
                dataKey="probabilidade"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorProbabilidade)"
                name="Prob. Chuva (%)"
              />
            </AreaChart>
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

