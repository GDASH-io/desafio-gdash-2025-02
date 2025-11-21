import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { differenceInMinutes, parseISO, format } from 'date-fns';

interface WeatherLog {
  _id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
  humidity?: number;
  precipitation_probability?: number;
  createdAt: string; 
}

interface WeatherInsights {
  averageTemperature: number;
  temperatureTrend: string;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function WeatherDashboard() {
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]);
  const [weatherInsights, setWeatherInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const logsResponse = await axios.get(`${API_BASE_URL}/api/weather/logs`);
      const now = new Date();
      const twoHoursAgo = 120; 

      const filteredLogs = logsResponse.data.filter((log: WeatherLog) => {
        const logCreatedAt = new Date(log.createdAt); 
        return differenceInMinutes(now, logCreatedAt) <= twoHoursAgo;
      });

      setWeatherLogs(filteredLogs);

      const insightsResponse = await axios.get(`${API_BASE_URL}/api/weather/insights`);
      setWeatherInsights(insightsResponse.data);
    } catch (err) {
      setError('Falha ao buscar dados de clima.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/weather/export.${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather_logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Falha ao exportar ${format}:`, err);
      alert(`Falha ao exportar ${format}.`);
    }
  };

  if (loading) return <p>Carregando dados de clima...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  const currentWeather = weatherLogs.length > 0 ? weatherLogs[weatherLogs.length - 1] : null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Painel de Clima</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentWeather && (
          <Card>
            <CardHeader>
              <CardTitle>Temperatura Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">{currentWeather.temperature}°C</p>
            </CardContent>
          </Card>
        )}

        {currentWeather?.humidity !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Umidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">{currentWeather.humidity}%</p>
            </CardContent>
          </Card>
        )}

        {currentWeather?.windspeed !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Velocidade do Vento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">{currentWeather.windspeed} km/h</p>
            </CardContent>
          </Card>
        )}

        {weatherInsights && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Insights de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl">{weatherInsights.message}</p>
              <p>Temperatura Média: {weatherInsights.averageTemperature}°C</p>
              <p>Tendência de Temperatura: {weatherInsights.temperatureTrend}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={() => handleExport('csv')}>Exportar CSV</Button>
        <Button onClick={() => handleExport('xlsx')}>Exportar XLSX</Button>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Histórico de Logs de Clima</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carimbo de Tempo</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Temperatura (°C)</TableHead>
              <TableHead>Umidade (%)</TableHead>
              <TableHead>Velocidade do Vento (km/h)</TableHead>
              <TableHead>Código do Clima</TableHead>
              <TableHead>É Dia</TableHead>
              <TableHead>Probabilidade de Precipitação (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weatherLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {format(parseISO(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>{log.latitude}</TableCell>
                <TableCell>{log.longitude}</TableCell>
                <TableCell>{log.temperature}</TableCell>
                <TableCell>{log.humidity ?? 'N/A'}</TableCell>
                <TableCell>{log.windspeed}</TableCell>
                <TableCell>{log.weathercode}</TableCell>
                <TableCell>{log.is_day === 1 ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{log.precipitation_probability ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
