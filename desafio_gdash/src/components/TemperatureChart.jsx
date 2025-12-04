import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TemperatureChart = ({ data, chartType = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Sem dados para exibir no gráfico</p>
        </CardContent>
      </Card>
    );
  }

  // Formatar dados para o gráfico (ordem cronológica)
  const chartData = [...data]
    .reverse()
    .slice(-30) // Últimos 30 registros
    .map((item) => ({
      time: format(new Date(item.createdAt), 'HH:mm', { locale: ptBR }),
      temperatura: item.temperature,
      umidade: item.humidity,
      vento: item.wind_speed,
    }));

  const getChartTitle = () => {
    switch (chartType) {
      case 'bar':
        return '📊 Histórico de Temperatura (Barras)';
      case 'area':
        return '📊 Histórico de Temperatura (Área)';
      case 'composed':
        return '📉 Histórico Combinado';
      default:
        return '📈 Histórico de Temperatura (Linha)';
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
    };

    const commonAxisProps = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
        <YAxis
          yAxisId="temp"
          tick={{ fontSize: 12 }}
          label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="humidity"
          orientation="right"
          tick={{ fontSize: 12 }}
          label={{ value: 'Umidade (%)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </>
    );

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar
              yAxisId="temp"
              dataKey="temperatura"
              fill="#f97316"
              name="Temperatura (°C)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="humidity"
              dataKey="umidade"
              fill="#3b82f6"
              name="Umidade (%)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonAxisProps}
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperatura"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorTemp)"
              name="Temperatura (°C)"
            />
            <Area
              yAxisId="humidity"
              type="monotone"
              dataKey="umidade"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorHumidity)"
              name="Umidade (%)"
            />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {commonAxisProps}
            <defs>
              <linearGradient id="colorTemp2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperatura"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorTemp2)"
              name="Temperatura (°C)"
            />
            <Bar
              yAxisId="humidity"
              dataKey="umidade"
              fill="#3b82f6"
              name="Umidade (%)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="vento"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Vento (km/h)"
            />
          </ComposedChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperatura"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Temperatura (°C)"
            />
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="umidade"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Umidade (%)"
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas {chartData.length} medições •{' '}
          {chartType === 'composed' ? 'Temperatura, Umidade e Vento' : 'Temperatura e Umidade'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TemperatureChart;
