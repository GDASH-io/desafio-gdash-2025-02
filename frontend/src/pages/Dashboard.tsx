import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { weatherService, WeatherLog, WeatherInsights } from '@/services/weather.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudLightning, Calendar, Home, BarChart3, Info, FileSpreadsheet, FileText } from 'lucide-react';

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('limpo') || conditionLower.includes('clear')) {
    return <Sun className="w-12 h-12 text-yellow-500" />;
  }
  if (conditionLower.includes('nublado') || conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return <Cloud className="w-12 h-12 text-gray-400" />;
  }
  if (conditionLower.includes('chuva') || conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className="w-12 h-12 text-blue-500" />;
  }
  if (conditionLower.includes('neve') || conditionLower.includes('snow')) {
    return <CloudSnow className="w-12 h-12 text-blue-300" />;
  }
  if (conditionLower.includes('tempestade') || conditionLower.includes('thunderstorm')) {
    return <CloudLightning className="w-12 h-12 text-purple-500" />;
  }
  if (conditionLower.includes('garoa')) {
    return <CloudDrizzle className="w-12 h-12 text-blue-400" />;
  }
  if (conditionLower.includes('vento') || conditionLower.includes('wind')) {
    return <Wind className="w-12 h-12 text-gray-500" />;
  }
  
  return <Cloud className="w-12 h-12 text-gray-400" />;
};

type DashboardView = 'home' | 'details' | 'analytics';

export const Dashboard = () => {
  const [view, setView] = useState<DashboardView>('home');
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  // Inicializar com a data de hoje, mas se não houver dados, usar a data do último registro
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [granularity, setGranularity] = useState<'hour' | 'day'>('hour');

  useEffect(() => {
    loadData();
    
    // Atualizar dados a cada 5 minutos para manter informações atualizadas
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // 5 minutos
    
    // Atualizar quando a página ficar visível novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    try {
      const [logsData, insightsData] = await Promise.all([
        weatherService.getLogs(1, 1000),
        weatherService.getInsights(1),
      ]);
      setLogs(logsData.data);
      setInsights(insightsData);
      
      // Se houver dados, ajustar a data selecionada para a data do registro mais recente apenas na primeira carga
      if (logsData.data.length > 0 && !loading) {
        const latestLogDate = new Date(logsData.data[0].timestamp);
        const latestDateBR = latestLogDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [day, month, year] = latestDateBR.split('/');
        const latestDateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Apenas ajustar se a data selecionada for hoje e não houver dados de hoje
        const todayISO = new Date().toISOString().split('T')[0];
        const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
        const selectedDateBR = new Date(selYear, selMonth - 1, selDay);
        const selectedDateData = logsData.data.filter((log) => {
          const logDate = new Date(log.timestamp);
          const logDateBRStr = logDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          const selectedDateBRStr = selectedDateBR.toLocaleDateString('pt-BR');
          return logDateBRStr === selectedDateBRStr;
        });
        
        // Só ajustar automaticamente na primeira carga (quando selectedDate é hoje e não há dados)
        if (selectedDateData.length === 0 && selectedDate === todayISO) {
          setSelectedDate(latestDateISO);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await weatherService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather_data.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportXlsx = async () => {
    setExporting(true);
    try {
      const blob = await weatherService.exportXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather_data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    } finally {
      setExporting(false);
    }
  };

  const filterDataByDate = (data: WeatherLog[]) => {
    if (!selectedDate) return data;

    // Criar data no início do dia no horário do Brasil
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateBR = new Date(year, month - 1, day);

    const filtered = data.filter((log) => {
      const logDate = new Date(log.timestamp);
      
      // Converter o timestamp do log para horário do Brasil e comparar apenas a data
      const logDateBRStr = logDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const selectedDateBRStr = selectedDateBR.toLocaleDateString('pt-BR');
      
      // Comparar as datas no horário do Brasil (formato DD/MM/YYYY)
      return logDateBRStr === selectedDateBRStr;
    });

    // Retornar apenas os dados filtrados (não fazer fallback para outros dias)
    return filtered;
  };

  // Função para remover duplicatas baseado no timestamp exato
  // Mantém todos os registros únicos, agrupando apenas duplicatas exatas (mesmo timestamp)
  const removeDuplicates = (data: WeatherLog[]): WeatherLog[] => {
    const seen = new Set<string>();
    const unique: WeatherLog[] = [];
    
    // Ordenar por timestamp (mais antigo primeiro)
    const sorted = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    for (const log of sorted) {
      // Usar timestamp completo como chave única
      const timestampKey = new Date(log.timestamp).toISOString();
      
      // Se não vimos este timestamp antes, adicionar ao array
      if (!seen.has(timestampKey)) {
        seen.add(timestampKey);
        unique.push(log);
      }
    }
    
    return unique;
  };

  // Função helper para calcular média com arredondamento
  const calculateAverage = (values: number[], decimals: number = 1): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    return parseFloat(avg.toFixed(decimals));
  };

  const processChartData = (data: WeatherLog[]) => {
    const filtered = filterDataByDate(data);
    // Remover duplicatas antes de processar
    const uniqueData = removeDuplicates(filtered);

    if (granularity === 'hour') {
      // Mapear todos os registros únicos mantendo o formato hora:minuto original
      return uniqueData
        .map((log) => {
          const logDate = new Date(log.timestamp);
          // Converter para horário do Brasil
          const brazilTimeStr = logDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          const brazilTime = new Date(brazilTimeStr);
          const timeString = brazilTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return {
            time: timeString,
            timestamp: new Date(log.timestamp).getTime(),
            temperatura: log.temperature,
            umidade: log.humidity,
            vento: log.windSpeed,
            chuva: log.rainProbability,
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp);
    } else {
      const grouped = uniqueData.reduce((acc, log) => {
        const logDate = new Date(log.timestamp);
        // Converter para horário do Brasil
        const brazilTimeStr = logDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const brazilTime = new Date(brazilTimeStr);
        const date = brazilTime.toLocaleDateString('pt-BR');
        if (!acc[date]) {
          acc[date] = {
            temps: [],
            humidities: [],
            winds: [],
            rains: [],
          };
        }
        acc[date].temps.push(log.temperature);
        acc[date].humidities.push(log.humidity);
        acc[date].winds.push(log.windSpeed);
        acc[date].rains.push(log.rainProbability);
        return acc;
      }, {} as Record<string, { temps: number[]; humidities: number[]; winds: number[]; rains: number[] }>);

      return Object.entries(grouped).map(([date, values]) => ({
        time: date,
        temperatura: calculateAverage(values.temps, 1),
        umidade: calculateAverage(values.humidities, 1),
        vento: calculateAverage(values.winds, 1),
        chuva: calculateAverage(values.rains, 1),
      }));
    }
  };

  // Remover duplicatas dos logs antes de usar e garantir ordenação correta
  const uniqueLogs = removeDuplicates(logs);
  // Garantir que o latestLog seja o mais recente (primeiro após ordenação)
  const latestLog = uniqueLogs.length > 0 ? uniqueLogs[0] : null;
  const chartData = processChartData(uniqueLogs);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 rounded-xl p-6 border border-blue-100/50 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resumo Climático</h1>
            <p className="text-gray-600 mt-1">Visão geral das condições climáticas atuais</p>
          </div>
        </div>
      </div>

      {latestLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/30 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-sm font-semibold text-gray-600">Temperatura</CardDescription>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">🌡️</div>
                </div>
              </div>
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{latestLog.temperature.toFixed(1)}°C</CardTitle>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-sm font-semibold text-gray-600">Umidade</CardDescription>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">💧</div>
                </div>
              </div>
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{latestLog.humidity.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-cyan-500 bg-gradient-to-br from-white to-cyan-50/30 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-sm font-semibold text-gray-600">Velocidade do Vento</CardDescription>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Wind className="w-7 h-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">{latestLog.windSpeed.toFixed(1)} km/h</CardTitle>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-sm font-semibold text-gray-600">Condição</CardDescription>
                <div className="flex items-center group-hover:scale-110 transition-transform duration-300">
                  {getWeatherIcon(latestLog.condition)}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mt-2">{latestLog.condition}</CardTitle>
              {latestLog.description && (
                <CardDescription className="mt-2 text-xs text-gray-500">{latestLog.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 rounded-xl p-6 border border-blue-100/50 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalhes Climáticos</h1>
              <p className="text-gray-600">Análise completa e exportação de dados</p>
            </div>
          </div>
          <div className="flex gap-3">
          <Button 
            onClick={handleExportCsv} 
            disabled={exporting} 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 px-6"
          >
            <FileText className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button 
            onClick={handleExportXlsx} 
            disabled={exporting}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 px-6"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Exportar XLSX'}
          </Button>
          </div>
        </div>
      </div>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada de IA</CardTitle>
            <CardDescription>Insights baseados nas condições climáticas atuais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.detailedAnalysis && (
              <div>
                <h3 className="font-semibold mb-2">Análise Completa</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insights.detailedAnalysis}
                </p>
              </div>
            )}

            {insights.activitySuggestions && insights.activitySuggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Sugestões de Atividades</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.activitySuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Tendências</h3>
              <p className="text-sm text-muted-foreground">{insights.trends}</p>
            </div>

            {insights.alerts && insights.alerts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Alertas</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-orange-600">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {latestLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visibilidade</CardDescription>
              <CardTitle className="text-3xl">
                {latestLog.visibility ? `${latestLog.visibility.toFixed(1)} km` : 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Umidade Relativa</CardDescription>
              <CardTitle className="text-3xl">{latestLog.humidity.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Radiação Solar</CardDescription>
              <CardTitle className="text-3xl">
                {latestLog.solarRadiation ? `${latestLog.solarRadiation.toFixed(0)} W/m²` : 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pressão Atmosférica</CardDescription>
              <CardTitle className="text-3xl">
                {latestLog.pressure ? `${latestLog.pressure.toFixed(1)} hPa` : 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {latestLog && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="text-2xl font-bold">{latestLog.temperature.toFixed(1)}°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Velocidade do Vento</p>
                <p className="text-2xl font-bold">{latestLog.windSpeed.toFixed(1)} km/h</p>
              </div>
              {latestLog.windDirection && (
                <div>
                  <p className="text-sm text-muted-foreground">Direção do Vento</p>
                  <p className="text-2xl font-bold">{latestLog.windDirection.toFixed(0)}°</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Probabilidade de Chuva</p>
                <p className="text-2xl font-bold">{latestLog.rainProbability.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 rounded-xl p-6 border border-blue-100/50 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análise Gráfica</h1>
            <p className="text-gray-600 mt-1">Visualização de dados climáticos ao longo do tempo</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Data</label>
              <div className="relative">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Granularidade</label>
              <div className="flex gap-2">
                <Button
                  variant={granularity === 'hour' ? 'default' : 'outline'}
                  onClick={() => setGranularity('hour')}
                  className="flex-1"
                >
                  Por Hora
                </Button>
                <Button
                  variant={granularity === 'day' ? 'default' : 'outline'}
                  onClick={() => setGranularity('day')}
                  className="flex-1"
                >
                  Por Dia
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {chartData.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Nenhum dado disponível para a data selecionada ({selectedDate}).</p>
              <p className="text-sm mt-2">Tente selecionar outra data ou aguarde novos registros.</p>
              <p className="text-xs mt-4 text-gray-500">
                Total de registros disponíveis: {uniqueLogs.length}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperatura</CardTitle>
              <CardDescription>°C ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)}°C`, 'Temperatura']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#f97316"
                  name="Temperatura (°C)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Velocidade do Vento</CardTitle>
            <CardDescription>km/h ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis label={{ value: 'km/h', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)} km/h`, 'Velocidade do Vento']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vento"
                  stroke="#3b82f6"
                  name="Velocidade do Vento (km/h)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Umidade</CardTitle>
            <CardDescription>% ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Umidade']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="umidade"
                  stroke="#10b981"
                  name="Umidade (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Possibilidade de Chuva</CardTitle>
            <CardDescription>% ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Probabilidade de Chuva']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="chuva"
                  stroke="#8b5cf6"
                  name="Probabilidade de Chuva (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'home' as DashboardView, label: 'Início', icon: Home },
    { id: 'details' as DashboardView, label: 'Detalhes', icon: Info },
    { id: 'analytics' as DashboardView, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Modern Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = view === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                onClick={() => setView(tab.id)}
                className={`flex-1 gap-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {view === 'home' && renderHome()}
        {view === 'details' && renderDetails()}
        {view === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};
