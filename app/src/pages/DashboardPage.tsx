import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { WeatherCards } from "@/components/WeatherCards";
import { InsightsCard } from "@/components/InsightsCard";
import { WeatherCharts } from "@/components/WeatherCharts";
import { StatisticsCard } from "@/components/StatisticsCard";
import { ComfortIndexCard } from "@/components/ComfortIndexCard";

export function DashboardPage() {
  const {
    dashboard,
    insights,
    isLoading,
    isRefreshing,
    isExporting,
    isLoadingInsights,
    loadDashboard,
    regenerateInsights,
    handleExportCSV,
    handleExportXLSX,
    chartData,
    currentLog,
    location,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        location={location}
        isRefreshing={isRefreshing}
        isExporting={isExporting}
        onRefresh={loadDashboard}
        onExportCSV={handleExportCSV}
        onExportXLSX={handleExportXLSX}
      />

      <WeatherCards currentLog={currentLog} />

      <InsightsCard
        insights={insights}
        isLoading={isLoadingInsights}
        onRegenerate={regenerateInsights}
      />

      <WeatherCharts chartData={chartData} />

      <StatisticsCard statistics={dashboard?.statistics} />

      <ComfortIndexCard comfort={dashboard?.comfort} />
    </div>
  );
}
