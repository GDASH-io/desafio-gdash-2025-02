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
import { WeatherDashboard, WeatherInsight } from "@/types/weather";
import {
  Download,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function DashboardPage() {
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
      console.log("Insights recebidos:", data);
      console.log("Trends:", data.trends);
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

  useEffect(() => {
    loadDashboard();
    loadInsights();
  }, []);

  // Preparar dados para gráficos
  const chartData = dashboard?.recentLogs?.data
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

  const getTrendIcon = (direction: string) => {
    if (direction === "rising") return <TrendingUp className="h-4 w-4" />;
    if (direction === "falling") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getAlertIcon = (type: string) => {
    if (type === "danger") return <AlertCircle className="h-5 w-5" />;
    if (type === "warning") return <AlertTriangle className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };

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

      {/* AI Insights Section */}
      {insights && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle>Insights de IA</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateInsights}
                disabled={isLoadingInsights}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isLoadingInsights ? "animate-spin" : ""
                  }`}
                />
                Regenerar
              </Button>
            </div>
            <CardDescription>{insights.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trends */}
            {insights.trends && insights.trends.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Tendências</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {insights.trends
                    .filter((trend) => trend.metric && trend.description)
                    .map((trend, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-lg bg-white border"
                      >
                        <div className="mt-0.5">
                          {getTrendIcon(trend.direction)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {trend.metric.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trend.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {insights.alerts && insights.alerts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Alertas</h4>
                <div className="space-y-2">
                  {insights.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.type === "danger"
                          ? "bg-red-50 border-red-200"
                          : alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations &&
              insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Recomendações</h4>
                  <ul className="space-y-1">
                    {insights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <p className="text-xs text-muted-foreground text-right">
              Gerado em:{" "}
              {new Date(insights.generatedAt).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {chartData && chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
              <CardDescription>
                Últimos {chartData.length} registros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#ef4444"
                    name="Temperatura (°C)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Probabilidade de Chuva e Umidade</CardTitle>
              <CardDescription>
                Últimos {chartData.length} registros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="chuva" fill="#3b82f6" name="Chuva (%)" />
                  <Bar dataKey="umidade" fill="#10b981" name="Umidade (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
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
