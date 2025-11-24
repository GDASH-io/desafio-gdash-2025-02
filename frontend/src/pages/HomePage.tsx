import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { weatherService } from "@/services/weatherService";
import type {
  WeatherLog,
  WeatherInsightsResponse,
} from "@/interfaces/weather";
import { toast } from "sonner";

import { WeatherFilterBar } from "@/components/layout/weather/WeatherFilterBar";
import { WeatherSummaryCards } from "@/components/layout/weather/WeatherSummaryCards";
import { WeatherTemperatureChart } from "@/components/layout/weather/WeatherTemperaturaChart";
import { WeatherTable } from "@/components/layout/weather/WeatherTable";
import { WeatherInsightsCard } from "@/components/layout/weather/WeatherInsightsCard";

function HomePage() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [days, setDays] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState<number>(0);

  const [selectedLog, setSelectedLog] = useState<WeatherLog | null>(null);

  const latestLog = useMemo(() => {
    if (!logs.length) return null;
    return [...logs].sort(
      (a, b) =>
        new Date(b.collected_at).getTime() -
        new Date(a.collected_at).getTime()
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
            new Date(a.collected_at).getTime() -
            new Date(b.collected_at).getTime()
        )
        .map((log) => ({
          time: new Date(log.collected_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: log.temperature,
          rain_probability: log.rain_probability,
        })),
    [logs]
  );

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [logsResponse, insightsResponse] = await Promise.all([
        weatherService.listWeatherLogs({
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        weatherService.getWeatherInsights({ days }),
      ]);

      setLogs(logsResponse.results);
      setTotalCount(logsResponse.count);
      setInsights((insightsResponse as WeatherInsightsResponse).insights);
    } catch (error) {
      toast.error("Erro ao carregar dados de clima", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, page]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6">
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
          <WeatherTemperatureChart data={chartData} isLoading={isLoading}/>
          <WeatherInsightsCard insights={insights} isLoading={isLoading} />
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
