import { useEffect, useState } from "react";
import {
  getInsights,
  getWeatherLogs,
  type WeatherInsight,
  type WeatherLog,
} from "../services/api";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";
import { HighlightsGrid } from "./dashboard/HighlightsGrid";
import { MainWeatherCard } from "./dashboard/MainWeatherCard";

export function WeatherDashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState<WeatherInsight | null>(null);

  const fetchData = async () => {
    try {
      const [logsData, insightData] = await Promise.all([
        getWeatherLogs(),
        getInsights(),
      ]);
      setLogs(logsData);
      setInsight(insightData);
    } catch (error) {
      console.error("Erro", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    // MUDANÇA 1: flex-col no mobile, lg:flex-row no desktop
    <div className="flex flex-col lg:flex-row min-h-screen bg-dashboard-bg text-dashboard-text font-sans selection:bg-dashboard-highlight selection:text-white">
      {/* MUDANÇA 2: Sidebar escondida no mobile (hidden), visível no desktop (lg:flex) */}
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto w-full">
        <DashboardHeader />

        {/* MUDANÇA 3: Grid de 1 coluna no mobile, 12 no desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-140px)]">
          <MainWeatherCard current={logs[0]} logs={logs} />
          <HighlightsGrid current={logs[0]} insight={insight} />
        </div>
      </main>
    </div>
  );
}
