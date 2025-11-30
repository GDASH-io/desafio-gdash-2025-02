import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LineChartComponentProps<T> {
  data: T[];
  xAxisKey: string;
  dataKey: string;
  yAxisLabel?: string;
  lineColor?: string;
  dotColor?: string;
  activeDotColor?: string;
}

function LineChartComponent<T>({ 
  data, 
  xAxisKey, 
  dataKey, 
  yAxisLabel = '', 
  lineColor = '#f59250',
  dotColor = '#fd751a',
  activeDotColor = '#b96000'
}: LineChartComponentProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
        <XAxis 
          dataKey={xAxisKey} 
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          style={{ fontSize: '12px' }}
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          labelStyle={{ color: 'hsl(var(--card-foreground))' }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={lineColor} 
          strokeWidth={3}
          dot={{ fill: dotColor, r: 5 }}
          activeDot={{ r: 7, fill: activeDotColor }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent