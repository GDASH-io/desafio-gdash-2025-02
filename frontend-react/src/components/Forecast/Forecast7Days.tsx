import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Dialog } from '../ui/Dialog';
import api from '../../app/api';
import { getWeatherCondition } from '../../utils/weather-condition';

interface ForecastDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation: number;
  wind_speed_max: number;
  cloud_cover: number;
  weather_code: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  cloud_cover: number;
  weather_code: number;
  pressure?: number;
  uv_index?: number;
}

export default function Forecast7Days() {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);
  const [hourlyDetails, setHourlyDetails] = useState<HourlyForecast[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await api.get('/weather/forecast/7days');
        // Se retornar array vazio, não é erro, apenas não há dados disponíveis
        if (Array.isArray(response.data)) {
          setForecast(response.data);
          if (response.data.length === 0) {
            setError('Previsão temporariamente indisponível. Tente novamente em alguns instantes.');
          }
        } else {
          setForecast([]);
          setError('Dados de previsão em formato inválido');
        }
        setLoading(false);
      } catch (err: any) {
        // Se o erro for 500 e retornar array vazio, tratar como indisponível
        if (err.response?.status === 500 || err.response?.status === 503) {
          setError('Serviço de previsão temporariamente indisponível. Tente novamente em alguns instantes.');
          setForecast([]);
        } else {
          setError(err.response?.data?.message || 'Erro ao carregar previsão');
        }
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    }
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDayClick = async (day: ForecastDay) => {
    setSelectedDay(day);
    setLoadingDetails(true);
    setDetailsError('');
    
    try {
      const dateParam = day.date.includes('T') ? day.date.split('T')[0] : day.date;
      const response = await api.get(`/weather/forecast/day/${dateParam}`);
      setHourlyDetails(response.data);
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || 'Erro ao carregar detalhes');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsão 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsão 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <div className="text-sm text-muted-foreground text-center">{error}</div>
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                const fetchForecast = async () => {
                  try {
                    const response = await api.get('/weather/forecast/7days');
                    if (Array.isArray(response.data)) {
                      setForecast(response.data);
                      setError('');
                    }
                  } catch (err: any) {
                    setError('Erro ao carregar previsão. Tente novamente.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchForecast();
              }}
              className="text-sm text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previsão 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {forecast.map((day, index) => {
            const weatherCondition = getWeatherCondition({
              weather_code: day.weather_code,
              clouds_percent: day.cloud_cover,
              precipitation_mm: day.precipitation,
              temperature_c: day.temperature_max,
              wind_speed_m_s: day.wind_speed_max,
            });

            // Garantir que sempre tenha ícone - fallback baseado em cloud_cover
            const icon = weatherCondition?.icon || (day.cloud_cover >= 80 ? '☁️' : day.cloud_cover >= 30 ? '🌤️' : '☀️');
            const label = weatherCondition?.label || (day.cloud_cover >= 80 ? 'Nublado' : day.cloud_cover >= 30 ? 'Parcialmente Nublado' : 'Ensolarado');

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{formatDate(day.date)}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-semibold">{day.temperature_max.toFixed(0)}°</div>
                    <div className="text-muted-foreground">{day.temperature_min.toFixed(0)}°</div>
                  </div>
                  {day.precipitation > 0 && (
                    <div className="text-blue-500 text-xs">
                      💧 {day.precipitation.toFixed(1)}mm
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Modal de Detalhes */}
      {selectedDay && (
        <Dialog
          open={!!selectedDay}
          onOpenChange={(open) => !open && setSelectedDay(null)}
          title={`Previsão Detalhada - ${formatFullDate(selectedDay.date)}`}
        >
          <div className="space-y-4">
            {/* Resumo do Dia */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Temp. Máxima</div>
                <div className="text-2xl font-bold">{selectedDay.temperature_max.toFixed(1)}°C</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Temp. Mínima</div>
                <div className="text-2xl font-bold">{selectedDay.temperature_min.toFixed(1)}°C</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Precipitação</div>
                <div className="text-2xl font-bold">{selectedDay.precipitation.toFixed(1)}mm</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Vento Máx</div>
                <div className="text-2xl font-bold">{selectedDay.wind_speed_max.toFixed(1)} m/s</div>
              </div>
            </div>

            {/* Detalhes Horários */}
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando detalhes...</div>
              </div>
            ) : detailsError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-destructive">{detailsError}</div>
              </div>
            ) : hourlyDetails.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Previsão Horária</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {hourlyDetails.map((hour, idx) => {
                    const hourCondition = getWeatherCondition({
                      weather_code: hour.weather_code,
                      clouds_percent: hour.cloud_cover,
                      precipitation_mm: hour.precipitation,
                      temperature_c: hour.temperature,
                      wind_speed_m_s: hour.wind_speed,
                      uv_index: hour.uv_index,
                    });

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{hourCondition?.icon || '🌤️'}</div>
                          <div>
                            <div className="font-medium">{formatTime(hour.time)}</div>
                            <div className="text-xs text-muted-foreground">
                              {hourCondition?.label || 'Nublado'}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">Temp</div>
                            <div className="font-semibold">{hour.temperature.toFixed(1)}°C</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Umidade</div>
                            <div className="font-semibold">{hour.humidity}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Vento</div>
                            <div className="font-semibold">{hour.wind_speed.toFixed(1)} m/s</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Chuva</div>
                            <div className="font-semibold">{hour.precipitation.toFixed(1)}mm</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Nenhum detalhe disponível</div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </Card>
  );
}

