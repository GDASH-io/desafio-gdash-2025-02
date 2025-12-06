import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  umidade: number;
  vento: number;
  chuva: number;
}

interface WeatherChartsProps {
  chartData: ChartDataPoint[] | undefined;
}

export function WeatherCharts({ chartData }: WeatherChartsProps) {
  if (!chartData || chartData.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
          <CardDescription>
            Últimos {chartData.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#ef4444"
                name="Temperatura (°C)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Probabilidade de Chuva e Umidade</CardTitle>
          <CardDescription>
            Últimos {chartData.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="chuva" fill="#3b82f6" name="Chuva (%)" />
              <Bar dataKey="umidade" fill="#10b981" name="Umidade (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
