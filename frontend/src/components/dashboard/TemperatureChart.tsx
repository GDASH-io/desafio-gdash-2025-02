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
import { format, startOfDay, endOfDay, eachHourOfInterval, isSameHour } from 'date-fns';
import { Thermometer } from 'lucide-react';

interface TemperatureChartProps {
  data: WeatherLog[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const { chartData, minTemp, maxTemp } = useMemo(() => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    
    const hours = eachHourOfInterval({ start, end });

    const chartData = hours.map((hour) => {
      const logsInHour = data.filter((log) => 
        isSameHour(new Date(log.timestamp), hour)
      );

      if (logsInHour.length === 0) {
        return {
          time: format(hour, 'HH:mm'),
          temperature: null,
          originalDate: hour,
        };
      }

      const avgTemp = logsInHour.reduce((acc, curr) => acc + curr.temperature, 0) / logsInHour.length;

      return {
        time: format(hour, 'HH:mm'),
        temperature: Math.round(avgTemp * 10) / 10,
        originalDate: hour,
      };
    });

    const validTemps = chartData
      .filter((d) => d.temperature !== null)
      .map((d) => d.temperature as number);

    const minTemp = validTemps.length > 0 ? Math.min(...validTemps) : 0;
    const maxTemp = validTemps.length > 0 ? Math.max(...validTemps) : 0;

    return { chartData, minTemp, maxTemp };
  }, [data]);

  const CustomDot = (props: any) => {
    const { cx, cy, value } = props;
    if (value === minTemp || value === maxTemp) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={5} fill={value === maxTemp ? "#ef4444" : "#3b82f6"} stroke="white" strokeWidth={2} />
          <text x={cx} y={cy - 10} textAnchor="middle" fill="#666" fontSize={12} fontWeight="bold">
            {value}°
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Temperatura (Hoje)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                interval={3}
              />
              <YAxis 
                hide 
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#666', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}