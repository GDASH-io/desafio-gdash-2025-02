import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { WeatherCards } from '@/components/dashboard/WeatherCards';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import { TemperatureChart } from '@/components/dashboard/TemperatureChart';
import { RainChart } from '@/components/dashboard/RainChart';
import { WeatherTable } from '@/components/dashboard/WeatherTable';
import { LayoutDashboard, MapPin, RefreshCw } from 'lucide-react';
import { weatherService } from '@/services/weather.service';
import { insightsService } from '@/services/insights.service';
import { WeatherLog, Insight } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

export function Dashboard() {
  const { toast } = useToast();
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [logsData, insightsData] = await Promise.all([
        weatherService.getLatest(50),
        insightsService.getLatest(),
      ]);

      setWeatherLogs(logsData);
      setInsights(insightsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInsights() {
    setInsightsLoading(true);
    try {
      await insightsService.generate();
      // Buscar os insights atualizados após gerar
      const latestInsights = await insightsService.getLatest();
      setInsights(latestInsights);
      toast({
        title: 'Insights gerados',
        description: `Novos insights foram gerados com sucesso!`,
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Erro ao gerar insights',
        description: 'Não foi possível gerar novos insights.',
        variant: 'destructive',
      });
    } finally {
      setInsightsLoading(false);
    }
  }

  const latestLog = weatherLogs[0];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" icon={<LayoutDashboard className="h-6 w-6" />} />

      <div className="space-y-6 p-6">
        {/* Location & Last Update */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {latestLog?.location.name || 'Florianópolis'}, SC - Brasil
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4" />
            <span>
              Última atualização:{' '}
              {format(lastUpdate, "HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Weather Cards */}
        <WeatherCards
          latestData={
            latestLog
              ? {
                  temperature: latestLog.temperature,
                  humidity: latestLog.humidity,
                  windSpeed: latestLog.windSpeed,
                  condition: latestLog.condition,
                }
              : undefined
          }
        />

        {/* Insights Card */}
        <InsightsCard
          insights={insights}
          onGenerate={handleGenerateInsights}
          loading={insightsLoading}
        />

        {/* Charts Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Monitoramento Diário</h2>
            <p className="text-sm text-gray-600">
              Acompanhe a variação de temperatura e probabilidade de chuva para hoje
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TemperatureChart data={weatherLogs} />
            <RainChart data={weatherLogs} />
          </div>
        </div>

        {/* Weather Table */}
        <WeatherTable data={weatherLogs} />
      </div>
    </div>
  );
}