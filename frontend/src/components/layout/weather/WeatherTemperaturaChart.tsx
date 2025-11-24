import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// interface ChartPoint {
//   time: string;
//   temperature: number;
//   rain_probability: number;
// }

// interface WeatherTemperatureChartProps {
//   data: ChartPoint[];
//   isLoading?: boolean;
// }

interface WeatherTemperatureChartProps {
  data: {
    time: string;
    temperature: number;
    rain_probability: number;
  }[];
  isLoading?: boolean;
}



export function WeatherTemperatureChart({
  data,
  isLoading = false,
}: WeatherTemperatureChartProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Temperatura ao longo do tempo
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full">
        {isLoading && <p className="text-sm text-slate-600">Carregando...</p>}

        {!isLoading && !hasData && (
          <p className="text-sm text-slate-600">
            Ainda não há dados para exibir o gráfico.
          </p>
        )}

        {!isLoading && hasData && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={["auto", "auto"]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}        
      </CardContent>
    </Card>
  );
}
