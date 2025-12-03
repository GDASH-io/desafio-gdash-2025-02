import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { weatherService, WeatherLog, WeatherInsights } from '@/services/weather.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logsData, insightsData] = await Promise.all([
        weatherService.getLogs(1, 10),
        weatherService.getInsights(7),
      ]);
      setLogs(logsData.data);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await weatherService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather_data.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportXlsx = async () => {
    setExporting(true);
    try {
      const blob = await weatherService.exportXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather_data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    } finally {
      setExporting(false);
    }
  };

  const latestLog = logs[0];
  const chartData = logs
    .slice()
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temperatura: log.temperature,
      umidade: log.humidity,
      chuva: log.rainProbability,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Climático</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCsv} disabled={exporting} variant="outline">
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button onClick={handleExportXlsx} disabled={exporting} variant="outline">
            {exporting ? 'Exportando...' : 'Exportar XLSX'}
          </Button>
        </div>
      </div>

      {latestLog && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Temperatura</CardDescription>
              <CardTitle className="text-4xl">{latestLog.temperature.toFixed(1)}°C</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Umidade</CardDescription>
              <CardTitle className="text-4xl">{latestLog.humidity.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Velocidade do Vento</CardDescription>
              <CardTitle className="text-4xl">{latestLog.windSpeed.toFixed(1)} km/h</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Condição</CardDescription>
              <CardTitle className="text-2xl">{latestLog.condition}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gráficos de Tendência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperatura" stroke="#8884d8" name="Temperatura (°C)" />
                <Line type="monotone" dataKey="umidade" stroke="#82ca9d" name="Umidade (%)" />
                <Line type="monotone" dataKey="chuva" stroke="#ffc658" name="Prob. Chuva (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Insights de IA</CardTitle>
            <CardDescription>Análise dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Resumo</h3>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tendências</h3>
              <p className="text-sm text-muted-foreground">{insights.trends}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Classificação</h3>
              <p className="text-sm">{insights.classification}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pontuação de Conforto</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${insights.comfortScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{insights.comfortScore}/100</span>
              </div>
            </div>
            {insights.alerts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Alertas</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-orange-600">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
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
                <TableHead>Prob. Chuva</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{log.location}</TableCell>
                  <TableCell>{log.condition}</TableCell>
                  <TableCell>{log.temperature.toFixed(1)}°C</TableCell>
                  <TableCell>{log.humidity.toFixed(1)}%</TableCell>
                  <TableCell>{log.windSpeed.toFixed(1)} km/h</TableCell>
                  <TableCell>{log.rainProbability.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

