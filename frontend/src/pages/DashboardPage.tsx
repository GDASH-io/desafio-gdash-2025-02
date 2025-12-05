import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { MetricCard } from '../components/MetricCard';
import { SidebarLayout } from '../components/Sidebar';

interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  city: string;
  createdAt: string;
}

interface Insights {
  summary: string;
  comfortScore: number;
  trend: string;
  alert?: string | null;
  hasData?: boolean;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] =
    useState<'csv' | 'xlsx' | null>(null);

  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    async function loadData() {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/');
        return;
      }

      try {
        const [logsRes, insightsRes] = await Promise.all([
          api.get<WeatherLog[]>('/weather/logs', { headers }),
          api.get<Insights>('/weather/insights', { headers }),
        ]);

        setLogs(logsRes.data);
        setInsights(insightsRes.data);
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err);

        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        }

        setError(
          'Erro ao carregar dados de clima. Tente novamente mais tarde.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  async function handleExport(type: 'csv' | 'xlsx') {
    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/');
      return;
    }

    try {
      setExportLoading(type);

      const endpoint =
        type === 'csv' ? '/weather/export/csv' : '/weather/export/xlsx';

      const response = await api.get(endpoint, {
        headers,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          type === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        type === 'csv' ? 'weather_logs.csv' : 'weather_logs.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erro ao exportar dados:', err);
      alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
    } finally {
      setExportLoading(null);
    }
  }

  // 🔍 Cálculos derivados dos logs (para os cards)
  const latestLog = useMemo(
    () => (logs.length > 0 ? logs[logs.length - 1] : null),
    [logs],
  );

  const stats = useMemo(() => {
    if (logs.length === 0) {
      return {
        avgTemp: null as number | null,
        avgHumidity: null as number | null,
        avgWind: null as number | null,
      };
    }

    const sum = logs.reduce(
      (acc, log) => {
        acc.temp += log.temperature;
        acc.humidity += log.humidity;
        acc.wind += log.windSpeed;
        return acc;
      },
      { temp: 0, humidity: 0, wind: 0 },
    );

    const count = logs.length;
    return {
      avgTemp: sum.temp / count,
      avgHumidity: sum.humidity / count,
      avgWind: sum.wind / count,
    };
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-300">Carregando dashboard...</p>
      </div>
    );
  }

  return (

     <SidebarLayout>
    
      {/* HEADER */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur">
        <h1 className="text-xl font-semibold">
          GDASH • <span className="text-emerald-400">Dashboard de Clima</span>
        </h1>


        <button
          onClick={handleLogout}
          className="text-sm text-slate-300 hover:text-emerald-400"
        >
          Sair
        </button>
      </header>

      {/* CONTEÚDO */}
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* linha de cards + ações */}
        <section className="flex flex-col gap-4">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Temperatura atual"
              value={
                latestLog
                  ? `${latestLog.temperature.toFixed(1)}°C`
                  : 'Sem dados'
              }
              subtitle={latestLog ? latestLog.city : ''}
              accent="green"
            />
            <MetricCard
              label="Umidade média"
              value={
                stats.avgHumidity !== null
                  ? `${stats.avgHumidity.toFixed(1)}%`
                  : 'N/A'
              }
              accent="blue"
              subtitle={
                insights?.comfortScore
                  ? `Conforto: ${insights.comfortScore}/100`
                  : undefined
              }
            />
            <MetricCard
              label="Vento médio"
              value={
                stats.avgWind !== null
                  ? `${stats.avgWind.toFixed(1)} km/h`
                  : 'N/A'
              }
              accent="yellow"
              subtitle={
                insights?.trend
                  ? `Tendência: ${insights.trend}`
                  : undefined
              }
            />
            <MetricCard
              label="Total de registros"
              value={logs.length.toString()}
              accent="red"
              subtitle={
                latestLog
                  ? `Último: ${new Date(
                      latestLog.createdAt,
                    ).toLocaleString('pt-BR')}`
                  : undefined
              }
            />
          </div>

          {/* Barra de ações de export */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 px-4 py-3 rounded-xl">
            <p className="text-sm text-slate-300">
              Exportar dados de clima registrados no sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('csv')}
                disabled={exportLoading === 'csv'}
                className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exportLoading === 'csv'
                  ? 'Exportando CSV...'
                  : 'Exportar CSV'}
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={exportLoading === 'xlsx'}
                className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exportLoading === 'xlsx'
                  ? 'Exportando XLSX...'
                  : 'Exportar XLSX'}
              </button>
            </div>
          </div>
        </section>

        {/* Insights */}
        {insights && insights.summary && (
          <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Insights de IA</h2>
            <p className="text-sm text-slate-200 mb-2">{insights.summary}</p>
            <p className="text-sm text-slate-300">
              Pontuação de conforto:{' '}
              <span className="font-semibold text-emerald-400">
                {insights.comfortScore}/100
              </span>{' '}
              • Tendência:{' '}
              <span className="font-semibold">{insights.trend}</span>
            </p>
            {insights.alert && (
              <p className="mt-2 text-sm text-amber-400">
                Alerta: {insights.alert}
              </p>
            )}
          </section>
        )}

        {/* Tabela */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Últimos registros</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-300">
              Nenhum dado de clima disponível ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-800">
                    <th className="py-2 pr-4">Data/Hora</th>
                    <th className="py-2 pr-4">Cidade</th>
                    <th className="py-2 pr-4">Temp (°C)</th>
                    <th className="py-2 pr-4">Umid (%)</th>
                    <th className="py-2 pr-4">Vento</th>
                    <th className="py-2 pr-4">Condição</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-900">
                      <td className="py-1 pr-4 text-slate-300">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-1 pr-4 text-slate-300">{log.city}</td>
                      <td className="py-1 pr-4">{log.temperature}</td>
                      <td className="py-1 pr-4">{log.humidity}</td>
                      <td className="py-1 pr-4">{log.windSpeed}</td>
                      <td className="py-1 pr-4">{log.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
  </SidebarLayout>
  );
}
