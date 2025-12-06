import { useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth";
import {
  weatherService,
  WeatherLog,
  InsightsResponse,
} from "@/services/weather";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WeatherCards } from "@/components/dashboard/WeatherCards";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { PrecipitationChart } from "@/components/dashboard/PrecipitationChart";
import { WeatherTable } from "@/components/dashboard/WeatherTable";
import {
  processTemperatureData,
  processPrecipitationData,
} from "@/utils/chartDataUtils";

export function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [todayLogs, setTodayLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [lastDataCollection, setLastDataCollection] = useState<Date | null>(
    null
  );

  const user = authService.getUser();

  const loadData = useCallback(async (isInitialLoad: boolean = false) => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }

      const [logsData, todayLogsData, insightsData] = await Promise.all([
        weatherService.getLogs(1, 50),
        weatherService.getLogs(1, 20),
        weatherService.getInsights(7),
      ]);

      const sortedLogs = [...(logsData.data || [])].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      const last20Logs = [...(todayLogsData.data || [])]
        .sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA; // Mais recente primeiro
        })
        .slice(0, 20); // Garantir que temos no máximo 20

      const latestLog = sortedLogs.length > 0 ? sortedLogs[0] : null;

      setLogs(sortedLogs);
      setTodayLogs(last20Logs);
      setInsights(insightsData);

      if (latestLog) {
        const timestampStr = latestLog.timestamp;
        let collectionTime: Date;

        if (
          !timestampStr.includes("Z") &&
          !timestampStr.includes("+") &&
          !timestampStr.includes("-", 10)
        ) {
          collectionTime = new Date(timestampStr + "Z");
        } else {
          collectionTime = new Date(timestampStr);
        }

        if (isNaN(collectionTime.getTime())) {
          collectionTime = new Date();
        }

        setLastDataCollection(collectionTime);
      }
    } catch (error) {
      void error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const updateInterval = setInterval(() => {
      loadData(false);
    }, 60000);

    return () => {
      clearInterval(updateInterval);
    };
  }, [loadData]);

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setExporting(true);
      const blob =
        format === "csv"
          ? await weatherService.exportCSV()
          : await weatherService.exportXLSX();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather_logs.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Erro ao exportar dados");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  const sortedLatestLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  const latestLog =
    sortedLatestLogs.length > 0 ? sortedLatestLogs[0] : undefined;

  const chartData = processTemperatureData(logs);
  const precipitationData = processPrecipitationData(latestLog);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 text-right">
          {lastDataCollection ? (
            <div className="flex items-center justify-end gap-2">
              <span>Última coleta de dados:</span>
              <span className="font-semibold text-gray-700">
                {new Date(lastDataCollection).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-green-500">●</span>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <span>Carregando dados...</span>
              <span className="text-yellow-500">●</span>
            </div>
          )}
        </div>

        {latestLog && <WeatherCards latestLog={latestLog} />}

        {insights && <InsightsSection insights={insights} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TemperatureChart data={chartData} />
          <PrecipitationChart data={precipitationData} />
        </div>

        <WeatherTable
          logs={todayLogs}
          exporting={exporting}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
