import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WeatherLog } from '@/types';

interface RainChartProps {
  data: WeatherLog[];
}

export function RainChart({ data }: RainChartProps) {
  const chartData = data.slice(-4).reverse().map((log, index) => ({
    label: index === 0 ? 'Agora' : `${index * 6}h`,
    probability: log.rainProbability || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probabilidade de Chuva</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="probability" fill="#17a2b8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}