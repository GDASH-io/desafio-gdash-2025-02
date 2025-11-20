import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { weatherService } from '@/services/weather.service';
import { insightsService } from '@/services/insights.service';
import { Download, Thermometer, Droplets, Wind, Cloud, CloudRain } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const { data: latest, isLoading: loadingLatest } = useQuery({
    queryKey: ['weather', 'latest'],
    queryFn: () => weatherService.getLatest(),
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['weather', 'logs', timeRange],
    queryFn: () => weatherService.getLogs({ limit: 50 }),
  });

  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ['insights', timeRange],
    queryFn: () => insightsService.getWeatherInsights(timeRange),
  });

  const handleExportCsv = async () => {
    try {
      const blob = await weatherService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      toast({
        title: 'Exportação realizada',
        description: 'Arquivo CSV baixado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  };

  const handleExportXlsx = async () => {
    try {
      const blob = await weatherService.exportXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      toast({
        title: 'Exportação realizada',
        description: 'Arquivo XLSX baixado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  };

  const chartData = logs?.data
    ?.slice()
    .reverse()
    .map((log) => ({
      date: format(new Date(log.timestamp), 'dd/MM HH:mm'),
      temperatura: log.temperatureC,
      umidade: log.humidity * 100,
      chuva: log.rainProbability * 100,
    }));

  if (loadingLatest || loadingLogs || loadingInsights) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Climático</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportXlsx}>
            <Download className="mr-2 h-4 w-4" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      {/* Cards de valores atuais */}
      {latest && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.temperatureC.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(latest.timestamp), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(latest.humidity * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Última leitura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.windSpeedKmh.toFixed(1)} km/h</div>
              <p className="text-xs text-muted-foreground">Velocidade do vento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chuva</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(latest.rainProbability * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Probabilidade</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Insights de IA</CardTitle>
                <CardDescription>Análise inteligente dos dados climáticos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === '24h' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('24h')}
                >
                  24h
                </Button>
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                >
                  7 dias
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                >
                  30 dias
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Índice de Conforto</p>
                <p className="text-2xl font-bold">{insights.comfortScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classificação</p>
                <p className="text-2xl font-bold capitalize">{insights.classification}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tendência</p>
                <p className="text-2xl font-bold capitalize">
                  {insights.metrics.trend === 'rising' ? '↑ Subindo' : insights.metrics.trend === 'falling' ? '↓ Descendo' : '→ Estável'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Resumo</p>
              <p className="text-sm text-muted-foreground">{insights.summaryText}</p>
            </div>
            {insights.alerts.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Alertas</p>
                <ul className="space-y-1">
                  {insights.alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {chartData && chartData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperatura" stroke="#8884d8" name="Temperatura (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Probabilidade de Chuva</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="chuva" stroke="#82ca9d" name="Chuva (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de registros */}
      {logs && logs.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
            <CardDescription>Últimos {logs.data.length} registros climáticos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data/Hora</th>
                    <th className="text-left p-2">Cidade</th>
                    <th className="text-left p-2">Temperatura</th>
                    <th className="text-left p-2">Umidade</th>
                    <th className="text-left p-2">Vento</th>
                    <th className="text-left p-2">Condição</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.data.map((log) => (
                    <tr key={log._id} className="border-b">
                      <td className="p-2">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="p-2">{log.city}</td>
                      <td className="p-2">{log.temperatureC.toFixed(1)}°C</td>
                      <td className="p-2">{(log.humidity * 100).toFixed(0)}%</td>
                      <td className="p-2">{log.windSpeedKmh.toFixed(1)} km/h</td>
                      <td className="p-2 capitalize">{log.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

