import { useState, useEffect } from 'react';
import { weatherService } from './services/weatherService';
import WeatherCard from './components/WeatherCard';
import TemperatureChart from './components/TemperatureChart';
import Statistics from './components/Statistics';
import WeatherPokemon from './components/WeatherPokemon';
import { RefreshCw } from 'lucide-react';
import './App.css';

function App() {
  const [latestWeather, setLatestWeather] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [timeRange, setTimeRange] = useState(24); // Filtro de período em horas
  const [chartType, setChartType] = useState('line'); // Tipo de gráfico

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const [statsData, recentLogsData] = await Promise.all([
        weatherService.getStats(),
        weatherService.getRecentLogs(timeRange),
      ]);

      setStats(statsData);
      setRecentData(recentLogsData);
      setLatestWeather(statsData.latest_record);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Atualizar automaticamente a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  if (loading && !latestWeather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !latestWeather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🌦️</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Dashboard Principal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitoramento climático em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              )}

              {/* Filtro de Período */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value={1}>Última hora</option>
                <option value={6}>Últimas 6 horas</option>
                <option value={12}>Últimas 12 horas</option>
                <option value={24}>Últimas 24 horas</option>
                <option value={48}>Últimas 48 horas</option>
                <option value={168}>Última semana</option>
              </select>

              {/* Seletor de Tipo de Gráfico */}
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="line">📈 Linha</option>
                <option value="area">📊 Área</option>
                <option value="bar">📊 Barras</option>
                <option value="composed">📉 Combinado</option>
              </select>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw
                  className={`h-5 w-5 text-blue-600 dark:text-blue-400 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Weather Card - Full Width */}
          <WeatherCard data={latestWeather} />

          {/* Weather Pokémon Card */}
          <WeatherPokemon weatherData={latestWeather} />

          {/* Statistics Cards */}
          <Statistics stats={stats} recentData={recentData} />

          {/* Temperature Chart */}
          <TemperatureChart data={recentData} chartType={chartType} />
        </div>

        {/* Data Table */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              📊 Histórico de Registros
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Últimos {recentData.length} registros coletados
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Temperatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Umidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Condição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentData.slice(0, 10).map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(record.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                      {record.temperature}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.humidity}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.wind_speed} km/h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Desenvolvido por Roberto Silva <span className="text-red-500">💡</span> usando React +
            NestJS + Go + Python
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Desafio Full-Stack Weather Dashboard - 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
