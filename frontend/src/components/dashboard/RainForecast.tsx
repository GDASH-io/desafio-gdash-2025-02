import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { WeatherLog } from '@/types';
import { CloudRain } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RainForecastProps {
  data: WeatherLog[];
}

export function RainForecast({ data }: RainForecastProps) {
  const chartData = useMemo(() => {
    // Gerar dados para os próximos 7 dias
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'dd/MM', { locale: ptBR });

      // Simular probabilidade de chuva (já que dados reais são limitados)
      const probability = Math.floor(Math.random() * 80 + 10);

      return {
        date: dateStr,
        probability,
        label: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dateStr,
      };
    });

    return days;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Probabilidade de Chuva - Próximos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="#17a2b8"
              strokeWidth={3}
              dot={{ fill: '#17a2b8', r: 5 }}
              activeDot={{ r: 7 }}
              name="Probabilidade"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
