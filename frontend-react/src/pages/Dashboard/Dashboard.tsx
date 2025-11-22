import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LineChart from '../../components/Chart/LineChart';
import InsightsSection from '../../components/Insights/InsightsSection';
import Forecast7Days from '../../components/Forecast/Forecast7Days';
import { usePolling } from '../../hooks/usePolling';
import api from '../../app/api';
import { getWeatherCondition, getSeverityColor, getSeverityTextColor } from '../../utils/weather-condition';
import { degreesToCardinal, getWindDirectionArrow } from '../../utils/wind-direction';
import { calculateHeatIndex, calculateDewPoint, getHeatIndexLevel, getDewPointLevel } from '../../utils/weather-calculations';

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
  pressure_hpa?: number;
  visibility_m?: number;
}

interface LatestReading {
  temperature_c: number;
  relative_humidity: number;
  wind_speed_m_s: number;
  estimated_irradiance_w_m2?: number;
  pv_derating_pct?: number;
  timestamp: string;
  weather_code?: number;
  clouds_percent?: number;
  precipitation_mm?: number;
  uv_index?: number;
  pressure_hpa?: number;
  visibility_m?: number;
  wind_direction_10m?: number;
  wind_gusts_10m?: number;
  precipitation_probability?: number;
}

export default function Dashboard() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [chartData, setChartData] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [precipitation24h, setPrecipitation24h] = useState<number | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const fetchLatest = async () => {
    try {
      const response = await api.get('/weather/logs/latest');
      setLatest(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    }
  };

  const fetchPrecipitation24h = async () => {
    try {
      const response = await api.get('/weather/precipitation/24h');
      setPrecipitation24h(response.data.accumulated_mm);
    } catch (err: any) {
      // Silenciar erro, não é crítico
      console.warn('Erro ao buscar chuva 24h:', err);
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
    fetchPrecipitation24h();
    
    // Atualizar data e hora a cada segundo
    const dateTimeInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(dateTimeInterval);
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

  const pressureData = chartData
    .slice()
    .reverse()
    .map((log) => (log as any).pressure_hpa || null)
    .filter((val) => val !== null);

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
          <p className="text-sm text-muted-foreground mt-1">
            Data e Hora atual: {currentDateTime.toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {latest && (() => {
          const weatherCondition = latest.weather_code !== undefined && latest.clouds_percent !== undefined
            ? getWeatherCondition({
                weather_code: latest.weather_code,
                clouds_percent: latest.clouds_percent,
                precipitation_mm: latest.precipitation_mm || 0,
                temperature_c: latest.temperature_c,
                wind_speed_m_s: latest.wind_speed_m_s,
                uv_index: latest.uv_index,
                visibility_m: latest.visibility_m,
              })
            : null;

          return (
            <>
              {/* Card de Condições Climáticas */}
              {weatherCondition && (
                <Card className={`${getSeverityColor(weatherCondition.severity)} border-2`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-4xl">{weatherCondition.icon}</span>
                      <div>
                        <div className={`text-xl font-bold ${getSeverityTextColor(weatherCondition.severity)}`}>
                          {weatherCondition.label}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {weatherCondition.description}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              )}

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                  {latest.wind_direction_10m !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getWindDirectionArrow(latest.wind_direction_10m)} {degreesToCardinal(latest.wind_direction_10m)}
                    </p>
                  )}
                  {latest.wind_gusts_10m !== undefined && latest.wind_gusts_10m > latest.wind_speed_m_s && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Rajadas: {latest.wind_gusts_10m.toFixed(1)} m/s
                    </p>
                  )}
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

              {latest.uv_index !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Índice UV
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {latest.uv_index.toFixed(1)}
                      {latest.uv_index >= 8 && <span className="text-yellow-600 ml-2">🔥</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latest.uv_index < 3 ? 'Baixo' : latest.uv_index < 6 ? 'Moderado' : latest.uv_index < 8 ? 'Alto' : 'Muito Alto'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {latest.pressure_hpa !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pressão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{latest.pressure_hpa.toFixed(0)} hPa</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latest.pressure_hpa < 1000 ? 'Baixa' : latest.pressure_hpa > 1020 ? 'Alta' : 'Normal'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {latest.precipitation_probability !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Prob. Chuva
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{latest.precipitation_probability}%</div>
                    {latest.precipitation_mm !== undefined && latest.precipitation_mm > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {latest.precipitation_mm.toFixed(1)} mm
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {precipitation24h !== null && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Chuva 24h
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{precipitation24h.toFixed(1)} mm</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Acumulado nas últimas 24h
                    </p>
                  </CardContent>
                </Card>
              )}

              {latest.temperature_c !== undefined && latest.relative_humidity !== undefined && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Sensação Térmica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const heatIndex = calculateHeatIndex(latest.temperature_c, latest.relative_humidity);
                        const level = getHeatIndexLevel(heatIndex);
                        return (
                          <>
                            <div className={`text-3xl font-bold ${level.color}`}>
                              {heatIndex.toFixed(1)}°C
                            </div>
                            <p className={`text-xs mt-1 ${level.color}`}>
                              {level.level}
                            </p>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ponto de Orvalho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const dewPoint = calculateDewPoint(latest.temperature_c, latest.relative_humidity);
                        const level = getDewPointLevel(dewPoint, latest.temperature_c);
                        return (
                          <>
                            <div className="text-3xl font-bold">{dewPoint.toFixed(1)}°C</div>
                            <p className={`text-xs mt-1 ${level.color}`}>
                              {level.level}
                            </p>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </>
              )}

              {latest.visibility_m !== undefined && latest.visibility_m < 10000 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Visibilidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(latest.visibility_m / 1000).toFixed(1)} km
                    </div>
                    {latest.visibility_m < 1000 && (
                      <p className="text-xs text-yellow-600 mt-1">⚠️ Neblina</p>
                    )}
                  </CardContent>
                </Card>
              )}

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
            </>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

          <Forecast7Days />

          {pressureData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendência Barométrica (Últimas 24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    data={{
                      labels: chartLabels.slice(-pressureData.length),
                      datasets: [
                        {
                          label: 'Pressão (hPa)',
                          data: pressureData,
                          borderColor: 'rgb(139, 92, 246)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          fill: true,
                        },
                      ],
                    }}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {(() => {
                    if (pressureData.length < 2) return 'Dados insuficientes';
                    const first = pressureData[0];
                    const last = pressureData[pressureData.length - 1];
                    const diff = last - first;
                    if (diff > 2) return '↑ Pressão subindo - Tempo firme';
                    if (diff < -2) return '↓ Pressão caindo - Chuva prevista';
                    return '→ Pressão estável';
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Seção de Insights */}
        <InsightsSection />
      </div>
    </Layout>
  );
}


