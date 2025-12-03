import { WeatherLog, getCurrentUser } from '../../services/api';
import { ensureArray } from '../../utils/array-helpers';

interface WeatherStatisticsProps {
  logs: unknown;
}

/**
 * Componente para exibir estatísticas dos logs climáticos
 */
export function WeatherStatistics({ logs }: WeatherStatisticsProps) {
  const safeLogs = ensureArray<WeatherLog>(logs);
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const avgTemperature =
    safeLogs.length > 0
      ? safeLogs.reduce((sum, log) => sum + log.temperature, 0) / safeLogs.length
      : 0;

  const avgHumidity =
    safeLogs.length > 0
      ? safeLogs.reduce((sum, log) => sum + log.humidity, 0) / safeLogs.length
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Temperatura Média</h3>
          <p className="text-2xl font-bold text-blue-600">{avgTemperature.toFixed(1)}°C</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Umidade Média</h3>
          <p className="text-2xl font-bold text-green-600">{avgHumidity.toFixed(1)}%</p>
        </div>
      </div>
      {isAdmin && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            Ver dados JSON
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto text-xs">
            {JSON.stringify(safeLogs.slice(0, 10), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

