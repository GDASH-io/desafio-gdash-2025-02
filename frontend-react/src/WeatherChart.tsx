import { 
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface ChartProps {
  data: any[];
}

// Custom Tooltip Component for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xl z-50">
        <p className="text-gray-600 font-mono text-xs mb-2 font-bold">{new Date(label).toLocaleString()}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 text-sm font-medium">{entry.name}:</span>
            <span className="text-gray-900 text-sm font-bold">
              {entry.value} {entry.unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WeatherChart({ data }: ChartProps) {
  const chartData = [...data].reverse();

  return (
    <div className="h-[450px] w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
            📊 Monitoramento em Tempo Real
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          
          <XAxis 
            dataKey="collected_at" 
            tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            stroke="#9CA3AF"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickMargin={10}
            minTickGap={40}
            axisLine={false}
            tickLine={false}
          />
          
          {/* Left Axis: Temperature */}
          <YAxis 
            yAxisId="left"
            stroke="#9CA3AF" 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°`}
          />

          {/* Right Axis: Humidity */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF" 
            domain={[0, 100]} 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D1D5DB', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

          {/* AREA: Temperature (Green) */}
          <Area 
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            name="Temperatura"
            unit="°C"
            stroke="#10B981"
            fill="url(#colorTemp)"
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#065F46' }}
          />

          {/* LINE: Humidity (Blue) */}
          <Line 
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            name="Umidade"
            unit="%"
            stroke="#0EA5E9" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* BAR: Wind Speed (Purple) */}
          <Bar 
            yAxisId="left"
            dataKey="wind_speed"
            name="Vento"
            unit="km/h"
            barSize={10}
            fill="#8B5CF6"
            opacity={0.3}
            radius={[4, 4, 0, 0]}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}