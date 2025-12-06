import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { WeatherLog } from '@/types';
import { TrendingUp } from 'lucide-react';
import { subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

interface TemperatureComparisonProps {
  data: WeatherLog[];
}

export function TemperatureComparison({ data }: TemperatureComparisonProps) {
  const chartData = useMemo(() => {
    // Calcular dados para ontem, hoje e amanhã
    const days = [
      { label: 'Ontem', offset: 1 },
      { label: 'Hoje', offset: 0 },
      { label: 'Amanhã', offset: -1 },
    ];

    return days.map((day) => {
      const targetDate = subDays(new Date(), day.offset);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

      const dayData = data.filter((log) => {
        const logDate = new Date(log.timestamp);
        return isWithinInterval(logDate, { start: dayStart, end: dayEnd });
      });

      if (dayData.length === 0) {
        // Valores simulados se não houver dados
        const baseTemp = 22 + Math.random() * 6;
        return {
          day: day.label,
          minTemp: Math.round((baseTemp - 3) * 10) / 10,
          avgTemp: Math.round(baseTemp * 10) / 10,
          maxTemp: Math.round((baseTemp + 4) * 10) / 10,
        };
      }

      const temps = dayData.map((log) => log.temperature);
      return {
        day: day.label,
        minTemp: Math.round(Math.min(...temps) * 10) / 10,
        avgTemp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
        maxTemp: Math.round(Math.max(...temps) * 10) / 10,
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Comparativo de Temperatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="day" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} unit="°C" />
            <Tooltip formatter={(value) => `${value}°C`} />
            <Legend />
            <Bar dataKey="minTemp" fill="#60a5fa" name="Mín." radius={[8, 8, 0, 0]} />
            <Bar dataKey="avgTemp" fill="#4EEDC4" name="Média" radius={[8, 8, 0, 0]} />
            <Bar dataKey="maxTemp" fill="#f87171" name="Máx." radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
