import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WeatherLog } from '@/types';
import { format } from 'date-fns';

interface TemperatureChartProps {
  data: WeatherLog[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data
    .slice(-24)
    .reverse()
    .map((log) => ({
      time: format(new Date(log.timestamp), 'HH:mm'),
      temperature: log.temperature,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperatura nas Últimas 24h</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#666"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#4EEDC4"
              strokeWidth={2}
              dot={{ fill: '#4EEDC4', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}