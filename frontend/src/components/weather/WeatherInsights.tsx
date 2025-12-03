import { WeatherInsights } from '../../services/api';

interface WeatherInsightsProps {
  insights: WeatherInsights | null;
}

/**
 * Componente para exibir insights e análises dos dados climáticos
 */
export function WeatherInsightsComponent({ insights }: WeatherInsightsProps) {
  if (!insights) {
    return null;
  }

  // Verificar se há dados suficientes (quando não há, o backend retorna apenas message e summary)
  // Se não tiver statistics, significa que não há dados suficientes
  const hasInsufficientData = !insights.statistics;

  if (hasInsufficientData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Insights de IA</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            {insights.summary || insights.message || 'Dados insuficientes para gerar insights'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Insights de IA</h2>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">{insights.summary}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Pontuação de Conforto
            </h3>
            <p className="text-2xl font-bold text-blue-600">{insights.comfortScore}/100</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Classificação</h3>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {insights.dayClassification}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tendência</h3>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {insights.statistics?.temperatureTrend || 'N/A'}
            </p>
          </div>
        </div>
        {insights.alerts && insights.alerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Alertas</h3>
            <ul className="list-disc list-inside space-y-1">
              {insights.alerts.map((alert, index) => (
                <li key={index} className="text-sm text-yellow-800">
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}
        {insights.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Temp. Média</p>
              <p className="font-semibold">
                {insights.statistics.averageTemperature?.toFixed(1) || 'N/A'}°C
              </p>
            </div>
            <div>
              <p className="text-gray-600">Umidade Média</p>
              <p className="font-semibold">
                {insights.statistics.averageHumidity?.toFixed(1) || 'N/A'}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Temp. Máx</p>
              <p className="font-semibold">
                {insights.statistics.maxTemperature?.toFixed(1) || 'N/A'}°C
              </p>
            </div>
            <div>
              <p className="text-gray-600">Temp. Mín</p>
              <p className="font-semibold">
                {insights.statistics.minTemperature?.toFixed(1) || 'N/A'}°C
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

