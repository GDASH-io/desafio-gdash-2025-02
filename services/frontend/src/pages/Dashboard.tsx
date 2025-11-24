import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '@/components/MetricCard';
import { weatherService } from '@/services/weather.service';
import { insightsService } from '@/services/insights.service';
import type { WeatherLog } from '@/types/weather.types';
import type { InsightContext } from '@/types/insights.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Gauge,
  CloudRain,
  Eye,
  Sparkles,
  MapPin,
  Loader2,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para dados do backend
  const [currentWeather, setCurrentWeather] = useState<WeatherLog | null>(null);
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [insightContext, setInsightContext] = useState<InsightContext>('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);
  
  useEffect(() => {
    loadWeatherData();
  }, []);
  
  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      const [latest, logsResponse] = await Promise.all([
        weatherService.getLatest(),
        weatherService.getLogs({ limit: 10 }),
      ]);
      
      if (latest) {
        setCurrentWeather(latest);
        setSelectedCity(`${latest.city}, ${latest.state}`);
      }
      
      if (logsResponse?.data) {
        setWeatherLogs(logsResponse.data);
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados climáticos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUVLevel = (index: number) => {
    if (index <= 2) return { label: 'Baixo', variant: 'secondary' as const };
    if (index <= 5) return { label: 'Moderado', variant: 'default' as const };
    if (index <= 7) return { label: 'Alto', variant: 'destructive' as const };
    return { label: 'Muito Alto', variant: 'destructive' as const };
  };

  // Dados derivados dos logs para gráficos
  const temperatureData = weatherLogs.slice(0, 8).reverse().map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: log.temperature,
    humidity: log.humidity,
  }));

  const recentLogs = weatherLogs.slice(0, 5).map((log, index) => ({
    id: index + 1,
    time: new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: log.temperature,
    humidity: log.humidity,
    wind: log.windSpeed,
    condition: log.condition,
  }));
  
  const uvLevel = currentWeather ? getUVLevel(currentWeather.uvIndex) : { label: 'N/A', variant: 'secondary' as const };

  const handleGenerateInsight = async () => {
    if (!currentWeather) {
      toast({
        variant: 'destructive',
        title: 'Dados insuficientes',
        description: 'Não há dados climáticos disponíveis para gerar insights.',
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedInsight(null);
    
    try {
      const response = await insightsService.generate({
        city: currentWeather.city,
        state: currentWeather.state,
        context: insightContext,
      });
      
      setGeneratedInsight(response.insights);
    } catch (error) {
      console.error('Error generating insight:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar insight',
        description: 'Não foi possível gerar o insight. Tente novamente.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast({
        title: 'Exportando CSV',
        description: 'O download será iniciado em breve...',
      });
      
      const blob = await weatherService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        variant: 'success',
        title: 'CSV exportado',
        description: 'Dados climáticos exportados com sucesso!',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os dados.',
      });
    }
  };

  const handleExportXLSX = async () => {
    try {
      toast({
        title: 'Exportando XLSX',
        description: 'O download será iniciado em breve...',
      });
      
      const blob = await weatherService.exportXLSX();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        variant: 'success',
        title: 'XLSX exportado',
        description: 'Dados climáticos exportados com sucesso!',
      });
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os dados.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados climáticos...</p>
        </div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <Card className="p-6 bg-white">
          <div className="text-center">
            <CloudRain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground mb-4">Não há dados climáticos disponíveis no momento.</p>
            <Button onClick={loadWeatherData}>Tentar novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8 bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo, {user?.name}! Acompanhe os dados climáticos em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <MapPin className="h-4 w-4" />
              <span>{selectedCity}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXLSX}>
              <FileDown className="mr-2 h-4 w-4" />
              XLSX
            </Button>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Temperatura"
            value={currentWeather.temperature}
            unit="°C"
            icon={Thermometer}
            description={`Sensação: ${currentWeather.feelsLike}°C`}
            trend="up"
          />
          <MetricCard
            title="Umidade"
            value={currentWeather.humidity}
            unit="%"
            icon={Droplets}
            description="Nível confortável"
            trend="neutral"
          />
          <MetricCard
            title="Vento"
            value={currentWeather.windSpeed}
            unit="km/h"
            icon={Wind}
            description="Brisa moderada"
            trend="neutral"
          />
          <MetricCard
            title="Índice UV"
            value={currentWeather.uvIndex}
            unit=""
            icon={Sun}
            description={uvLevel.label}
            trend="up"
          />
        </div>

        {/* Métricas secundárias */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Pressão"
            value={currentWeather.pressure}
            unit="hPa"
            icon={Gauge}
            description="Normal"
          />
          <MetricCard
            title="Visibilidade"
            value={currentWeather.visibility}
            unit="km"
            icon={Eye}
            description="Ótima visibilidade"
          />
          <MetricCard
            title="Prob. Chuva"
            value={currentWeather.rainProbability}
            unit="%"
            icon={CloudRain}
            description="Chance de chuva"
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Temperatura */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Temperatura nas últimas 24h</CardTitle>
              <CardDescription>Variação da temperatura ao longo do dia</CardDescription>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

          {/* Gráfico de Umidade */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Umidade nas últimas 24h</CardTitle>
              <CardDescription>Variação da umidade relativa do ar</CardDescription>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Umidade (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

        {/* Tabela de logs recentes */}
        <Card className="shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
            <CardDescription>
              Últimas leituras de dados climáticos
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Umidade</TableHead>
                <TableHead>Vento</TableHead>
                <TableHead>Condição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      {log.temp}°C
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      {log.humidity}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-gray-500" />
                      {log.wind} km/h
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.condition}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        {/* Card de AI Insights */}
        <Card className="shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Análises inteligentes sobre os dados climáticos usando IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Análise
                </label>
                <Select value={insightContext} onValueChange={(value) => setInsightContext(value as InsightContext)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contexto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Análise Geral</SelectItem>
                    <SelectItem value="alerts">Alertas Importantes</SelectItem>
                    <SelectItem value="recommendations">Recomendações</SelectItem>
                    <SelectItem value="trends">Análise de Tendências</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateInsight}
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Insight
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Área de exibição do insight */}
            {generatedInsight ? (
              <div className="rounded-lg border p-6" style={{ background: 'linear-gradient(to bottom right, rgb(250 245 255), rgb(239 246 255))' }}>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-1">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-3 text-purple-900">
                      {insightContext === 'general' && 'Análise Geral do Clima'}
                      {insightContext === 'alerts' && 'Alertas Importantes'}
                      {insightContext === 'recommendations' && 'Recomendações Personalizadas'}
                      {insightContext === 'trends' && 'Análise de Tendências'}
                    </h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {generatedInsight}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200 flex items-center gap-2 text-xs text-purple-600">
                      <Sparkles className="h-3 w-3" />
                      <span>Gerado por IA • {new Date().toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecione um tipo de análise e clique em "Gerar Insight" para obter análises inteligentes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
