import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ThermometerSun,
  Droplets,
  Wind,
  CloudRain,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(24);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/weather/insights?hours=${hours}`);
      setInsights(response.data);
    } catch (err) {
      console.error('Erro ao buscar insights:', err);
      setError(err.response?.data?.message || 'Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Gerando insights de IA...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchInsights}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, statistics, patterns, recommendations, generated_at, ai_insights } =
    insights || {};
  const { temperature, humidity, wind_speed, precipitation, period } = statistics || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <span>Insights de IA</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise inteligente dos dados climáticos
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value={6}>Últimas 6 horas</option>
              <option value={12}>Últimas 12 horas</option>
              <option value={24}>Últimas 24 horas</option>
              <option value={48}>Últimas 48 horas</option>
            </select>
            <Button onClick={fetchInsights} variant="outline" size="icon">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resumo Geral</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Análise de {period?.records || 0} registros coletados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{summary}</p>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Período:{' '}
                {period?.start &&
                  format(new Date(period.start), "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })}{' '}
                até{' '}
                {period?.end &&
                  format(new Date(period.end), "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Temperature */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <ThermometerSun className="h-5 w-5 text-orange-500" />
                <span>Temperatura</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Atual:</span>
                  <span className="font-bold text-lg">
                    {temperature?.current != null ? Number(temperature.current).toFixed(1) : 'N/A'}
                    °C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                  <span className="font-semibold">
                    {temperature?.avg != null ? Number(temperature.avg).toFixed(3) : '0.000'}
                    °C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mín/Máx:</span>
                  <span className="font-semibold">
                    {temperature?.min != null ? Number(temperature.min).toFixed(1) : 'N/A'}
                    °C / {temperature?.max != null ? Number(temperature.max).toFixed(1) : 'N/A'}
                    °C
                  </span>
                </div>
                <div
                  className={`mt-2 px-2 py-1 rounded text-sm font-medium ${
                    temperature?.trend != null && Number(temperature.trend) > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                  }`}
                >
                  Tendência:{' '}
                  {temperature?.trend != null
                    ? (Number(temperature.trend) > 0 ? '+' : '') +
                      Number(temperature.trend).toFixed(1)
                    : '0.0'}
                  °C
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span>Umidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Atual:</span>
                  <span className="font-bold text-lg">
                    {humidity?.current != null ? Number(humidity.current).toFixed(1) : 'N/A'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                  <span className="font-semibold">
                    {humidity?.avg != null ? Number(humidity.avg).toFixed(3) : '0.000'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mín/Máx:</span>
                  <span className="font-semibold">
                    {humidity?.min != null ? Number(humidity.min).toFixed(1) : 'N/A'}% /{' '}
                    {humidity?.max != null ? Number(humidity.max).toFixed(1) : 'N/A'}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wind */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Wind className="h-5 w-5 text-green-500" />
                <span>Vento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Atual:</span>
                  <span className="font-bold text-lg">
                    {wind_speed?.current != null ? Number(wind_speed.current).toFixed(1) : 'N/A'}{' '}
                    km/h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                  <span className="font-semibold">
                    {wind_speed?.avg != null ? Number(wind_speed.avg).toFixed(3) : '0.000'} km/h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Máxima:</span>
                  <span className="font-semibold">
                    {wind_speed?.max != null ? Number(wind_speed.max).toFixed(1) : 'N/A'} km/h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precipitation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <CloudRain className="h-5 w-5 text-indigo-500" />
                <span>Precipitação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-bold text-lg">
                    {precipitation?.total != null ? Number(precipitation.total).toFixed(1) : '0.0'}{' '}
                    mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                  <span className="font-semibold">
                    {precipitation?.avg != null ? Number(precipitation.avg).toFixed(3) : '0.000'} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Máxima:</span>
                  <span className="font-semibold">
                    {precipitation?.max != null ? Number(precipitation.max).toFixed(1) : '0.0'} mm
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patterns Detected */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Padrões Detectados</span>
              </CardTitle>
              <CardDescription>Anomalias e comportamentos identificados</CardDescription>
            </CardHeader>
            <CardContent>
              {patterns && patterns.length > 0 ? (
                <ul className="space-y-3">
                  {patterns.map((pattern, index) => {
                    const patternText =
                      typeof pattern === 'string'
                        ? pattern
                        : pattern?.description || JSON.stringify(pattern);
                    return (
                      <li
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                      >
                        <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                        <span className="text-sm">{patternText}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum padrão anômalo detectado no período analisado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Recomendações</span>
              </CardTitle>
              <CardDescription>Sugestões baseadas nas condições atuais</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations && recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const recText =
                      typeof rec === 'string' ? rec : rec?.description || JSON.stringify(rec);
                    return (
                      <li
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      >
                        <span className="text-purple-600 dark:text-purple-400">💡</span>
                        <span className="text-sm">{recText}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Condições normais, sem recomendações especiais
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights with Prediction (if available) */}
        {ai_insights && (
          <Card className="mt-6 border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Análise e Previsão com IA (Together AI)</span>
              </CardTitle>
              <CardDescription>
                Análise baseada em dados de 5 minutos + Previsão para as próximas 6 horas
                <br />
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  ⚡ Cache inteligente: atualizado a cada 6 horas
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {ai_insights}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Generated At */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Insights gerados em{' '}
          {generated_at &&
            format(new Date(generated_at), "dd/MM/yyyy 'às' HH:mm:ss", {
              locale: ptBR,
            })}
        </div>
      </div>
    </div>
  );
};

export default Insights;
