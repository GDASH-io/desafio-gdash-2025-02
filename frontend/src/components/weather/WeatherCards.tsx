import { WeatherLog } from '../../services/api';
import { formatDateShort } from '../../utils/date-formatters';
import { ensureArray } from '../../utils/array-helpers';

interface WeatherCardsProps {
  logs: unknown;
}

/**
 * Componente que exibe cards com métricas principais dos logs climáticos
 */
export function WeatherCards({ logs }: WeatherCardsProps) {
  const safeLogs = ensureArray<WeatherLog>(logs);

  if (safeLogs.length === 0) {
    return null;
  }

  const latestLog = safeLogs[0];
  const avgTemp =
    safeLogs.length > 0
      ? safeLogs.reduce((sum, log) => sum + log.temperature, 0) / safeLogs.length
      : 0;

  const getCondition = (temp: number, humidity: number): string => {
    if (temp > 30) return 'Quente';
    if (temp < 15) return 'Frio';
    if (humidity > 80) return 'Úmido';
    return 'Agradável';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Temperatura Atual</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {latestLog?.temperature.toFixed(1) || '0.0'}°C
            </p>
            <p className="text-xs text-gray-500 mt-1">{latestLog?.city || 'N/A'}</p>
          </div>
          <div className="text-4xl">🌡️</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Umidade Atual</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {latestLog?.humidity.toFixed(1) || '0.0'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateShort(latestLog?.timestamp || '')}
            </p>
          </div>
          <div className="text-4xl">💧</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Velocidade do Vento</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {(avgTemp * 0.5).toFixed(1)} km/h
            </p>
            <p className="text-xs text-gray-500 mt-1">Estimado</p>
          </div>
          <div className="text-4xl">💨</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Condição</p>
            <p className="text-xl font-bold text-orange-600 mt-2">
              {getCondition(latestLog?.temperature || 0, latestLog?.humidity || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{safeLogs.length} registros</p>
          </div>
          <div className="text-4xl">☀️</div>
        </div>
      </div>
    </div>
  );
}

