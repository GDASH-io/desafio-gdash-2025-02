import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { weatherService } from "@/services/weather.service";
import { WeatherDashboard, WeatherInsight } from "@/types/weather";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<WeatherDashboard | null>(null);
  const [insights, setInsights] = useState<WeatherInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const { toast } = useToast();

  const loadDashboard = async () => {
    try {
      setIsRefreshing(true);
      const data = await weatherService.getDashboard({ recentLogsLimit: 20 });
      setDashboard(data);
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dashboard",
        description:
          error.response?.data?.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const data = await weatherService.getInsights();
      setInsights(data);
    } catch (error: any) {
      console.error("Erro ao carregar insights:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar insights",
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const regenerateInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const data = await weatherService.generateInsights();
      setInsights(data);
      toast({
        title: "Insights atualizados",
        description: "Análise de IA regenerada com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar insights",
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await weatherService.exportCSV();
      weatherService.downloadFile(
        blob,
        `weather-data-${new Date().toISOString()}.csv`
      );
      toast({
        title: "Exportação concluída",
        description: "Arquivo CSV baixado com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    try {
      setIsExporting(true);
      const blob = await weatherService.exportXLSX();
      weatherService.downloadFile(
        blob,
        `weather-data-${new Date().toISOString()}.xlsx`
      );
      toast({
        title: "Exportação concluída",
        description: "Arquivo XLSX baixado com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getChartData = () => {
    return dashboard?.recentLogs?.data
      ?.slice()
      .reverse()
      .map((log) => ({
        time: new Date(log.collectedAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperatura: log.temperature,
        umidade: log.humidity,
        vento: log.windSpeed,
        chuva: log.rainProbability,
      }));
  };

  useEffect(() => {
    loadDashboard();
    loadInsights();
  }, []);

  return {
    dashboard,
    insights,
    isLoading,
    isRefreshing,
    isExporting,
    isLoadingInsights,

    loadDashboard,
    loadInsights,
    regenerateInsights,
    handleExportCSV,
    handleExportXLSX,

    chartData: getChartData(),
    currentLog: dashboard?.recentLogs?.data?.[0],
    location: dashboard?.location || "Natal, RN",
  };
}
