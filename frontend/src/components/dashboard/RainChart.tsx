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
} from 'recharts';
import { WeatherLog } from '@/types';
import { CloudRain } from 'lucide-react';
import { format, startOfDay, endOfDay, eachHourOfInterval, isSameHour } from 'date-fns';

interface RainChartProps {
  data: WeatherLog[];
}

export function RainChart({ data }: RainChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    
    const hours = eachHourOfInterval({ start, end });

    return hours.map((hour) => {
      const logsInHour = data.filter((log) => 
        isSameHour(new Date(log.timestamp), hour)
      );

      if (logsInHour.length === 0) {
        return {
          time: format(hour, 'HH:mm'),
          probability: null,
        };
      }

      const avgProb = logsInHour.reduce((acc, curr) => acc + (curr.rainProbability || 0), 0) / logsInHour.length;

      return {
        time: format(hour, 'HH:mm'),
        probability: Math.round(avgProb),
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Probabilidade de Chuva (Hoje)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                interval={3}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value}%`, 'Probabilidade']}
              />
              <Line 
                type="monotone" 
                dataKey="probability" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}