import { useState } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { Button } from '../ui/button';
import { ChartData, defaultChartOptions } from '../../utils/chart-helpers';

interface WeatherChartProps {
  chartData: ChartData | null;
}

/**
 * Componente de gráfico para visualização de dados climáticos
 */
export function WeatherChart({ chartData }: WeatherChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('line');

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Gráfico de Temperatura e Umidade
          </h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          Nenhum dado disponível para exibir no gráfico
        </p>
      </div>
    );
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Gráfico de Temperatura e Umidade
        </h2>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Linha
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Barras
          </Button>
          <Button
            variant={chartType === 'radar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('radar')}
          >
            Radar
          </Button>
        </div>
      </div>
      <div className="h-96">
        {chartType === 'line' && <Line data={chartData} options={defaultChartOptions} />}
        {chartType === 'bar' && <Bar data={chartData} options={defaultChartOptions} />}
        {chartType === 'radar' && <Radar data={chartData} options={radarOptions} />}
      </div>
    </div>
  );
}

