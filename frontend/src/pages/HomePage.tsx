import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { weatherService } from "@/services/weatherService";
import type { WeatherLog, WeatherInsight } from "@/interfaces/weather";
import { toast } from "sonner";

import { WeatherFilterBar } from "@/components/layout/weather/WeatherFilterBar";
import { WeatherSummaryCards } from "@/components/layout/weather/WeatherSummaryCards";
import { WeatherTemperatureChart } from "@/components/layout/weather/WeatherTemperaturaChart";
import { WeatherTable } from "@/components/layout/weather/WeatherTable";
import { WeatherInsightsCard } from "@/components/layout/weather/WeatherInsightsCard";

function HomePage() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [latestInsightId, setLatestInsightId] = useState<number | null>(null);
  const [days, setDays] = useState<number>(3);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState<number>(0);

  const [selectedLog, setSelectedLog] = useState<WeatherLog | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>("Brasília");
  const [isGeneratingWeather, setIsGeneratingWeather] = useState(false);

  const latestLog = useMemo(() => {
    if (!logs.length) return null;
    return [...logs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }, [logs]);

  const currentLog = useMemo(
    () => selectedLog ?? latestLog,
    [selectedLog, latestLog]
  );

  const chartData = useMemo(
    () =>
      logs
        .slice()
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((log) => ({
          time: new Date(log.timestamp).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: log.temperature,
          rain_probability: 0,
        })),
    [logs]
  );

  // ---- Carregar logs ----
  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const logsResponse = await weatherService.listWeatherLogs({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        // se depois você filtrar por cidade no backend, pode mandar: city: selectedCity,
      });

      setLogs(logsResponse.results);
      setTotalCount(logsResponse.count);
    } catch (error) {
      toast.error("Erro ao carregar dados de clima", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Carregar último insight (/insights/latest/) ----
  const loadLatestInsight = async () => {
    try {
      setIsInsightsLoading(true);
      const latest: WeatherInsight | null =
        await weatherService.getLatestWeatherInsight();

      if (latest) {
        setInsights(latest.text);
        setLatestInsightId(latest.id);
      }
    } catch (error) {
      // se der erro, só mostra toast opcional
      console.error(error);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  // carrega logs + último insight na entrada e ao trocar days/page
  useEffect(() => {
    loadLogs();
    loadLatestInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, page]);

  // se o log selecionado sair da lista, limpa seleção
  useEffect(() => {
    if (selectedLog && !logs.some((l) => l.id === selectedLog.id)) {
      setSelectedLog(null);
    }
  }, [logs, selectedLog]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await weatherService.exportWeatherCsv({ limit: 100, offset: 0 });
      toast.success("Exportação CSV iniciada.");
    } catch (error) {
      toast.error("Erro ao exportar CSV", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setIsExporting(true);
      await weatherService.exportWeatherXlsx({ limit: 100, offset: 0 });
      toast.success("Exportação XLSX iniciada.");
    } catch (error) {
      toast.error("Erro ao exportar XLSX", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // helper pra esperar o novo insight aparecer no /latest/
  const waitForNewInsight = async (
    previousId: number | null,
    attempts = 5,
    delayMs = 2000
  ) => {
    for (let i = 0; i < attempts; i++) {
      const latest = await weatherService.getLatestWeatherInsight();
      if (latest && latest.id !== previousId) {
        setInsights(latest.text);
        setLatestInsightId(latest.id);
        return;
      }
      // espera um pouco antes de tentar de novo
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  };

  // chamado ao clicar em "Gerar clima" no header
  const handleGenerateWeatherForCity = async (city: string) => {
    try {
      setIsGeneratingWeather(true);
      setIsInsightsLoading(true);
      setSelectedCity(city);
      setPage(1);
      setSelectedLog(null);

      const previousInsightId = latestInsightId;

      // 1) coleta clima em tempo real
      await weatherService.fetchCityWeather(city);
      await loadLogs(); // atualiza tabela/gráfico

      // 2) dispara geração de insight para esta cidade (tarefa assíncrona)
      const hours = days * 24;
      await weatherService.generateWeatherInsightForCity({ hours, city });

      // 3) espera o /latest/ mudar para o novo insight
      await waitForNewInsight(previousInsightId);

      toast.success(`Clima e insight de IA atualizados para ${city}.`);
    } catch (error) {
      toast.error("Erro ao coletar clima/insight da cidade", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsGeneratingWeather(false);
      setIsInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <AppHeader
        selectedCity={selectedCity}
        onGenerateWeather={handleGenerateWeatherForCity}
        isGeneratingWeather={isGeneratingWeather}
      />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6 max-w-6xl mx-auto w-full">
        <WeatherFilterBar
          days={days}
          isLoading={isLoading}
          isExporting={isExporting}
          onDaysChange={setDays}
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
        />

        <WeatherSummaryCards log={currentLog} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <WeatherTemperatureChart data={chartData} isLoading={isLoading} />
          <WeatherInsightsCard
            insights={insights}
            isLoading={isInsightsLoading}
          />
        </div>

        <WeatherTable
          logs={logs}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() =>
            setPage((prev) =>
              prev * pageSize >= totalCount ? prev : prev + 1
            )
          }
          selectedId={currentLog?.id ?? null}
          onSelectLog={setSelectedLog}
        />
      </main>
    </div>
  );
}

export default HomePage;
