import { WeatherLog } from '../services/api';
import { formatDateShort } from './date-formatters';
import { ensureArray } from './array-helpers';

/**
 * Configuração de dados para gráficos Chart.js
 */
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    yAxisID: string;
    tension: number;
  }>;
}

/**
 * Prepara dados de logs climáticos para exibição em gráficos.
 * Limita a 50 registros mais recentes e inverte a ordem para exibição cronológica.
 *
 * @param logs - Array de logs climáticos (pode ser array ou objeto paginado)
 * @returns Dados formatados para Chart.js ou null se não houver dados
 */
export function prepareChartData(logs: unknown): ChartData | null {
  const safeLogs = ensureArray<WeatherLog>(logs);

  if (safeLogs.length === 0) {
    return null;
  }

  try {
    // Pegar os últimos 50 registros e inverter para ordem cronológica
    const displayLogs = safeLogs.slice(0, 50).reverse();

    const labels = displayLogs.map((log) => formatDateShort(log.timestamp));
    const temperatures = displayLogs.map((log) => log.temperature);
    const humidities = displayLogs.map((log) => log.humidity);

    return {
      labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temperatures,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
        },
        {
          label: 'Umidade (%)',
          data: humidities,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
        },
      ],
    };
  } catch (error) {
    console.error('[frontend] chartData: erro ao processar logs:', error);
    return null;
  }
}

/**
 * Opções padrão para gráficos Chart.js
 */
export const defaultChartOptions = {
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
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Temperatura (°C)',
      },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Umidade (%)',
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

