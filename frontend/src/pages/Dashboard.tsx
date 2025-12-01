import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { weatherService, WeatherLog, WeatherInsights } from '../services/weather.service';
import { Download, Cloud, Droplets, Wind, Thermometer, AlertTriangle, CloudRain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  
  const formatCondition = (condition: string): string => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, insightsData] = await Promise.all([
        weatherService.getLogs(50),
        weatherService.getInsights(),
      ]);
      setLogs(logsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await weatherService.exportCSV();
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  const handleExportXLSX = async () => {
    try {
      await weatherService.exportXLSX();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    }
  };

  const chartData = logs
    .slice()
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperatura: log.temperature || null,
      umidade: log.humidity || null,
      chuva: log.precipitationProbability !== null && log.precipitationProbability !== undefined 
        ? log.precipitationProbability 
        : null,
    }))
    .filter(item => item.temperatura !== null || item.umidade !== null || item.chuva !== null);

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Climático</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real das condições climáticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportXLSX}>
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      {insights?.latest && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.latest.temperature?.toFixed(1) || 'N/A'}°C
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.latest.humidity?.toFixed(1) || 'N/A'}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.latest.windSpeed?.toFixed(1) || 'N/A'} km/h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condição</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCondition(insights.latest.condition)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prob. Chuva</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.latest.precipitationProbability !== undefined && insights.latest.precipitationProbability !== null
                  ? `${insights.latest.precipitationProbability.toFixed(0)}%`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {insights && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Insights de IA</CardTitle>
              <CardDescription>Análise inteligente dos dados climáticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Resumo</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {insights.summary}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Estatísticas</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Temp. Média:</span>{' '}
                    {insights.statistics.averageTemperature?.toFixed(1) || 'N/A'}°C
                  </div>
                  <div>
                    <span className="text-muted-foreground">Umidade Média:</span>{' '}
                    {insights.statistics.averageHumidity?.toFixed(1) || 'N/A'}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vento Médio:</span>{' '}
                    {insights.statistics.averageWindSpeed?.toFixed(1) || 'N/A'} km/h
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registros:</span>{' '}
                    {insights.statistics.totalRecords}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Conforto Climático</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${insights.comfort.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{insights.comfort.score}/100</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {insights.comfort.classification}
                </p>
              </div>
              {insights.alerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Alertas
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {insights.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Monitoramento</CardTitle>
              <CardDescription>Temperatura, Umidade e Probabilidade de Chuva</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Temp (°C) / Umidade (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: 'Prob. Chuva (%)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    formatter={(value: any, name: string) => {
                      if (value === null) return ['N/A', name];
                      return [value.toFixed(1), name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Temperatura (°C)"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="umidade"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Umidade (%)"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="chuva"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Prob. Chuva (%)"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>Últimos dados coletados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Umidade</TableHead>
                <TableHead>Vento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{log.location.name}</TableCell>
                    <TableCell>{formatCondition(log.condition)}</TableCell>
                    <TableCell>
                      {log.temperature?.toFixed(1) || 'N/A'}°C
                    </TableCell>
                    <TableCell>{log.humidity?.toFixed(1) || 'N/A'}%</TableCell>
                    <TableCell>
                      {log.windSpeed?.toFixed(1) || 'N/A'} km/h
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}