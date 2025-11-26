import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseISO, format } from 'date-fns';

interface WeatherHistoryData {
  logs: Array<{
    _id: string;
    timestamp: string;
    temperature: number;
  }>;
  insights: string;
  temperatureTrend: string;
  averageTemperature: number;
  temperatureData: Array<{
    date: string;
    temperature: number;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function WeatherHistory() {
  const [historyData, setHistoryData] = useState<WeatherHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get<WeatherHistoryData>(`${API_BASE_URL}/api/weather/history-insights`);
        setHistoryData(response.data);
      } catch (err) {
        setError('Falha ao buscar histórico de clima.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p className="text-[#E5E7EB]">Carregando histórico...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (!historyData || historyData.logs.length === 0) {
    return (
      <div className="p-4 bg-[#0D1117] border border-[#1F2937] rounded-lg">
        <p className="text-[#E5E7EB]">Dados insuficientes para exibir histórico. Continue coletando dados para ver análises mais detalhadas.</p>
      </div>
    );
  }

  // Calcular valores para o gráfico
  const maxTemp = Math.max(...historyData.temperatureData.map(d => d.temperature));
  const minTemp = Math.min(...historyData.temperatureData.map(d => d.temperature));
  const range = maxTemp - minTemp || 1;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-[#E5E7EB] mb-1.5">Como estava nos últimos dias</h4>
        <p className="text-sm font-light text-[#9CA3AF]">{historyData.insights}</p>
      </div>

      {/* Mini-gráfico de temperatura */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-[#E5E7EB]">Temperatura nos últimos {historyData.logs.length} dias</h5>
        <div className="flex items-end space-x-2 h-24 border-b border-white/5 pb-2">
          {historyData.temperatureData.map((data, index) => {
            const height = ((data.temperature - minTemp) / range) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-[#3B82F6] rounded-t transition-all hover:bg-[#3B82F6]/80"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${data.temperature}°C - ${format(parseISO(data.date), 'dd/MM')}`}
                />
                <span className="text-xs text-[#9CA3AF]">{format(parseISO(data.date), 'dd/MM')}</span>
                <span className="text-xs font-semibold text-[#E5E7EB]">{data.temperature}°C</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights da IA */}
      <div className="mt-3 p-2.5 bg-[#161B22] border border-white/5 rounded-lg">
        <p className="text-xs text-[#00D9FF] font-medium mb-1">💡 Insight da IA:</p>
        <p className="text-[#E5E7EB] text-xs font-light">{historyData.temperatureTrend}</p>
      </div>

      {/* Tabela de dados */}
      <div className="mt-3">
        <h5 className="text-xs font-medium text-[#E5E7EB] mb-1.5">Dados detalhados</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-1.5 text-xs font-medium text-[#E5E7EB]">Data</th>
                <th className="text-right py-1.5 text-xs font-medium text-[#E5E7EB]">Temperatura</th>
              </tr>
            </thead>
            <tbody>
              {historyData.logs.slice(0, 7).map((log) => (
                <tr key={log._id} className="border-b border-white/5">
                  <td className="py-1.5 text-xs font-light text-[#9CA3AF]">
                    {format(parseISO(log.timestamp), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="text-right py-1.5 text-xs font-medium text-[#E5E7EB]">
                    {log.temperature}°C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

