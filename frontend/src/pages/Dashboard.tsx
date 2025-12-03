import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { getWeatherInsights, getAvailableCities, getWeatherLogsPaginated, WeatherInsights, WeatherLog } from '../services/api';
import { useWeatherLogs } from '../hooks/useWeatherLogs';
import { useWeatherFilters } from '../hooks/useWeatherFilters';
import { useWeatherCharts } from '../hooks/useWeatherCharts';
import { useWeatherExports } from '../hooks/useWeatherExports';
import { useToast } from '../hooks/use-toast';
import { WeatherCards } from '../components/weather/WeatherCards';
import { WeatherFilters } from '../components/weather/WeatherFilters';
import { WeatherTable } from '../components/weather/WeatherTable';
import { WeatherPagination } from '../components/weather/WeatherPagination';
import { WeatherChart } from '../components/weather/WeatherChart';
import { WeatherStatistics } from '../components/weather/WeatherStatistics';
import { WeatherInsightsComponent } from '../components/weather/WeatherInsights';
import { CitySelector } from '../components/weather/CitySelector';
import { ensureArray } from '../utils/array-helpers';
import { BrazilianCapital, DEFAULT_CAPITAL } from '../utils/brazilian-capitals';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Componente principal do Dashboard de dados climáticos
 */
function Dashboard() {
  // Estado para cidade selecionada (persistido no localStorage)
  const [selectedCity, setSelectedCity] = useState<BrazilianCapital>(() => {
    const saved = localStorage.getItem('selectedCity');
    return (saved as BrazilianCapital) || DEFAULT_CAPITAL;
  });

  // Estado separado para logs da listagem (filtrados)
  const { logs, pagination, loading, error, fetchLogs } = useWeatherLogs();
  
  // Estado separado para logs dos componentes do topo (baseado na cidade selecionada)
  const [topLogs, setTopLogs] = useState<WeatherLog[]>([]);
  const [topLogsLoading, setTopLogsLoading] = useState(false);

  const {
    page,
    limit,
    goToPageInput,
    cityFilter,
    startDate,
    endDate,
    setPage,
    setGoToPageInput,
    setCityFilter,
    setStartDate,
    setEndDate,
    applyFilters,
    handlePageChange,
    handleLimitChange,
    handleGoToPage,
  } = useWeatherFilters({ fetchLogs, pagination });
  const { exporting, handleExportCsv, handleExportXlsx } = useWeatherExports();
  const { toast } = useToast();
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Chart data para logs do topo (baseado na cidade selecionada)
  const { chartData } = useWeatherCharts(topLogs);

  // Salvar cidade selecionada no localStorage
  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  // Carregar dados iniciais - usar flag para evitar requisições duplicadas
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (!isMounted) return;
      
      // Sequencial para evitar sobrecarregar o rate limiting
      try {
        await fetchLogs(1, 10); // Listagem sem filtros iniciais
      } catch (err) {
        console.error('[frontend] Error in initial fetchLogs:', err);
      }
      
      if (!isMounted) return;
      try {
        await fetchTopLogs(selectedCity); // Dados do topo baseados na cidade selecionada
      } catch (err) {
        console.error('[frontend] Error in initial fetchTopLogs:', err);
      }
      
      if (!isMounted) return;
      try {
        await fetchInsights(selectedCity);
      } catch (err) {
        console.error('[frontend] Error in initial fetchInsights:', err);
      }
      
      if (!isMounted) return;
      try {
        await fetchAvailableCities();
      } catch (err) {
        console.error('[frontend] Error in initial fetchAvailableCities:', err);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando a cidade selecionada mudar, atualizar dados do topo (cards, insights, estatísticas, gráficos)
  useEffect(() => {
    fetchTopLogs(selectedCity);
    fetchInsights(selectedCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  // Função para buscar logs do topo (baseado na cidade selecionada)
  const fetchTopLogs = async (city?: string) => {
    setTopLogsLoading(true);
    try {
      const data = await getWeatherLogsPaginated(1, 100, city); // Buscar mais registros para os componentes do topo
      const logsArray = ensureArray<WeatherLog>(data.data || []);
      setTopLogs(logsArray);
    } catch (err: any) {
      console.error('[frontend] Error fetching top logs:', err);
      const errorMessage = err?.message || 'Erro ao buscar logs';
      if (err?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Muitas requisições')) {
        toast({
          title: 'Muitas requisições',
          description: 'Por favor, aguarde um momento antes de tentar novamente.',
          variant: 'destructive',
        });
      }
      setTopLogs([]);
    } finally {
      setTopLogsLoading(false);
    }
  };

  const fetchAvailableCities = async () => {
    try {
      const cities = await getAvailableCities();
      setAvailableCities(cities);
    } catch (err: any) {
      console.error('[frontend] Error fetching available cities:', err);
      const errorMessage = err?.message || 'Erro ao buscar cidades';
      if (err?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Muitas requisições')) {
        toast({
          title: 'Muitas requisições',
          description: 'Por favor, aguarde um momento antes de tentar novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const fetchInsights = async (city?: string) => {
    try {
      const data = await getWeatherInsights(city);
      setInsights(data);
    } catch (err: any) {
      console.error('[frontend] Error fetching insights:', err);
      const errorMessage = err?.message || 'Erro ao buscar insights';
      if (err?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Muitas requisições')) {
        toast({
          title: 'Muitas requisições',
          description: 'Por favor, aguarde um momento antes de tentar novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCityChange = (city: BrazilianCapital) => {
    setSelectedCity(city);
  };

  // Sobrescrever clearFilters
  const handleClearFilters = () => {
    setCityFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs(1, limit);
  };

  const handleRefresh = () => {
    // Atualizar apenas a listagem com os filtros aplicados
    fetchLogs(page, limit, cityFilter || undefined, startDate || undefined, endDate || undefined);
  };

  const handleGoToPageWithToast = () => {
    const result = handleGoToPage();
    if (result && !result.success) {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const safeLogs = ensureArray(logs);
  const hasActiveFilters = !!(cityFilter || startDate || endDate);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Weather Dashboard</h1>
              <p className="text-muted-foreground">Visualização dos últimos logs climáticos</p>
            </div>
            <div className="flex items-center">
              <CitySelector selectedCity={selectedCity} onCityChange={handleCityChange} />
            </div>
          </div>
        </header>

        {/* 1 - Cards */}
        {!topLogsLoading && topLogs.length > 0 && <WeatherCards logs={topLogs} />}

        {/* 2 - Insights de IA */}
        {insights && <WeatherInsightsComponent insights={insights} />}

        {/* 3 - Estatísticas (seção "Ver dados JSON" apenas para ADMIN) */}
        {!topLogsLoading && topLogs.length > 0 && (
          <div className="mb-6">
            <WeatherStatistics logs={topLogs} />
          </div>
        )}

        {/* 4 - Gráfico de temperatura e umidade */}
        {!topLogsLoading && topLogs.length > 0 && (
          <div className="mb-6">
            <WeatherChart chartData={chartData} />
          </div>
        )}

        {/* Estados de Loading e Erro */}
        {loading && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg mb-4">
            Carregando dados...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && !error && safeLogs.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
            {cityFilter
              ? `Nenhum log encontrado para a cidade "${cityFilter}".`
              : 'Nenhum log encontrado.'}
          </div>
        )}

        {/* 5 - Dados Climáticos (Filtros, Listagem, Paginação e Exportação) */}
        {!loading && !error && (
          <div className="bg-card rounded-lg shadow-md p-4 mb-6 border border-border">
            <div className="flex gap-2 flex-wrap items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Dados Climáticos</h3>
              <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>

            {/* Filtros dentro do card */}
            <WeatherFilters
              cityFilter={cityFilter}
              startDate={startDate}
              endDate={endDate}
              loading={loading}
              availableCities={availableCities}
              onCityFilterChange={setCityFilter}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApplyFilters={applyFilters}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Espaçamento entre filtros e lista */}
            <div className="mt-6"></div>

            {safeLogs.length > 0 && (
              <>
                <WeatherTable logs={logs} />

                <WeatherPagination
                  pagination={pagination}
                  limit={limit}
                  goToPageInput={goToPageInput}
                  loading={loading}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  onGoToPageInputChange={setGoToPageInput}
                  onGoToPage={handleGoToPageWithToast}
                />

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex gap-2 flex-wrap items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Exportação</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleExportCsv}
                        disabled={!!exporting || loading}
                        size="sm"
                      >
                        {exporting === 'csv' ? 'Exportando...' : 'Exportar CSV'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleExportXlsx}
                        disabled={!!exporting || loading}
                        size="sm"
                      >
                        {exporting === 'xlsx' ? 'Exportando...' : 'Exportar XLSX'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
