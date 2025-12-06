import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { weatherService } from "@/services/weather.service";
import { WeatherDashboard } from "@/types/weather";
import {
  Download,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
} from "lucide-react";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<WeatherDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const loadDashboard = async () => {
    try {
      setIsRefreshing(true);
      const data = await weatherService.getDashboard({ recentLogsLimit: 10 });
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

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const currentLog = dashboard?.recentLogs?.data?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Climático</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real - {dashboard?.location || "Natal, RN"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadDashboard}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportXLSX}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            XLSX
          </Button>
        </div>
      </div>

      {/* Current Weather Cards */}
      {currentLog ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLog.temperature.toFixed(1)}°C
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(currentLog.collectedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentLog.humidity}%</div>
              <p className="text-xs text-muted-foreground">
                Umidade relativa do ar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLog.windSpeed.toFixed(1)} km/h
              </div>
              <p className="text-xs text-muted-foreground">
                Velocidade do vento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condição</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize">
                {currentLog.skyCondition}
              </div>
              <p className="text-xs text-muted-foreground">
                🌧️ Chuva: {currentLog.rainProbability}%
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhum dado climático disponível no momento
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {dashboard?.statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Período</CardTitle>
            <CardDescription>
              {dashboard.statistics.dataPointsAnalyzed} registros analisados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Temperatura
                </p>
                <p className="text-2xl font-bold">
                  {dashboard.statistics.temperature.average.toFixed(1)}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  Min: {dashboard.statistics.temperature.min.toFixed(1)}°C |
                  Max: {dashboard.statistics.temperature.max.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Umidade Média
                </p>
                <p className="text-2xl font-bold">
                  {dashboard.statistics.humidity.average.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vento Médio
                </p>
                <p className="text-2xl font-bold">
                  {dashboard.statistics.windSpeed.average.toFixed(1)} km/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comfort Index */}
      {dashboard?.comfort && dashboard.comfort.score !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Índice de Conforto</CardTitle>
            <CardDescription>Análise das condições atuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {dashboard.comfort.score}
              </div>
              <p className="text-lg font-medium capitalize">
                {dashboard.comfort.classification.replace(/_/g, " ")}
              </p>
              {dashboard.comfort.recommendations && (
                <div className="mt-4 text-left space-y-1">
                  {dashboard.comfort.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      • {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
