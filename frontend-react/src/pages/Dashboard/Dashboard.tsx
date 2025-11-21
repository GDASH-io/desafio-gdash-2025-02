import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LineChart from '../../components/Chart/LineChart';
import { usePolling } from '../../hooks/usePolling';
import api from '../../app/api';

interface WeatherLog {
  _id: string;
  timestamp: string;
  city: string;
  temperature_c: number;
  relative_humidity: number;
  wind_speed_m_s: number;
  estimated_irradiance_w_m2?: number;
  pv_derating_pct?: number;
  precipitation_mm: number;
  clouds_percent: number;
}

interface LatestReading {
  temperature_c: number;
  relative_humidity: number;
  wind_speed_m_s: number;
  estimated_irradiance_w_m2?: number;
  pv_derating_pct?: number;
  timestamp: string;
}

export default function Dashboard() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [chartData, setChartData] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLatest = async () => {
    try {
      const response = await api.get('/weather/logs/latest');
      setLatest(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await api.get('/weather/logs', { params: { limit: 24, sort: 'desc' } });
      // A resposta pode vir como array direto ou como objeto com data
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setChartData(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    fetchChartData();
  }, []);

  usePolling(fetchLatest, 30000, true);

  const chartLabels = chartData
    .slice()
    .reverse()
    .map((log) => new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  const temperatureData = chartData
    .slice()
    .reverse()
    .map((log) => log.temperature_c);

  const irradianceData = chartData
    .slice()
    .reverse()
    .map((log) => log.estimated_irradiance_w_m2 || 0);

  const chartDataset = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temperatureData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Irradiância (W/m²)',
        data: irradianceData,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Clima</h1>
          <p className="text-muted-foreground">Dados em tempo real de Coronel Fabriciano, MG</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {latest && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latest.temperature_c.toFixed(1)}°C</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Umidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latest.relative_humidity.toFixed(0)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latest.wind_speed_m_s.toFixed(1)} m/s</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Irradiância
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {latest.estimated_irradiance_w_m2?.toFixed(0) || 'N/A'} W/m²
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  PV Derating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {latest.pv_derating_pct?.toFixed(1) || '0'}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Temperatura e Irradiância ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {chartData.length > 0 ? (
                <LineChart data={chartDataset} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


