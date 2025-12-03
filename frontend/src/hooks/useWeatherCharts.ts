import { useMemo, useState } from 'react';
import { prepareChartData, defaultChartOptions } from '../utils/chart-helpers';

/**
 * Hook para gerenciar lógica de gráficos climáticos
 */
export function useWeatherCharts(logs: unknown) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('line');

  const chartData = useMemo(() => {
    return prepareChartData(logs);
  }, [logs]);

  return {
    chartData,
    chartType,
    setChartType,
    chartOptions: defaultChartOptions,
  };
}

