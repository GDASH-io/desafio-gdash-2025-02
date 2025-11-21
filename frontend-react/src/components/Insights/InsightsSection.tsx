import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import api from '../../app/api';

interface Insights {
  period: {
    from: string;
    to: string;
  };
  pv_metrics: {
    soiling_risk?: {
      level: string;
      score: number;
      message: string;
    };
    consecutive_cloudy_days?: {
      consecutive_days: number;
      estimated_reduction_pct: number;
      message: string;
    };
    heat_derating?: {
      temp_c: number;
      derating_pct: number;
      message: string;
    };
    wind_derating?: {
      wind_speed_m_s: number;
      risk_level: string;
      message: string;
    };
    estimated_production_pct: number;
    estimated_production_kwh?: number;
  };
  statistics: {
    avg_temp: number;
    avg_humidity: number;
    trend: 'rising' | 'falling' | 'stable';
    classification: string;
  };
  alerts: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;
  summary: string;
  scores: {
    comfort_score: number;
    pv_production_score: number;
  };
  generated_at: string;
}

export default function InsightsSection() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // Buscar insights dos últimos 7 dias
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 7);

      const response = await api.get('/weather/insights', {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      setInsights(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Carregando insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insights de IA - Análise dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumo */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Resumo</h3>
            <p className="text-blue-800 text-sm">{insights.summary}</p>
          </div>

          {/* Pontuações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conforto Climático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{insights.scores.comfort_score}</div>
                <div className="text-xs text-muted-foreground mt-1">Pontuação: 0-100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Produção PV Estimada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{insights.scores.pv_production_score}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {insights.pv_metrics.estimated_production_kwh?.toFixed(1) || 'N/A'} kWh estimados
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas PV */}
          <div>
            <h3 className="font-semibold mb-3">Métricas de Energia Solar</h3>
            <div className="space-y-3">
              {insights.pv_metrics.soiling_risk && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Risco de Sujeira</span>
                    <span className={`text-sm font-semibold ${getLevelColor(insights.pv_metrics.soiling_risk.level)}`}>
                      {insights.pv_metrics.soiling_risk.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insights.pv_metrics.soiling_risk.message}</p>
                </div>
              )}

              {insights.pv_metrics.consecutive_cloudy_days && insights.pv_metrics.consecutive_cloudy_days.consecutive_days > 0 && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Dias Consecutivos Nublados</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {insights.pv_metrics.consecutive_cloudy_days.consecutive_days} dias
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insights.pv_metrics.consecutive_cloudy_days.message}
                  </p>
                </div>
              )}

              {insights.pv_metrics.heat_derating && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Derating por Calor</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {insights.pv_metrics.heat_derating.derating_pct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insights.pv_metrics.heat_derating.message}</p>
                </div>
              )}

              <div className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Produção Estimada</span>
                  <span className="text-sm font-semibold text-green-600">
                    {insights.pv_metrics.estimated_production_pct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Capacidade estimada baseada em condições climáticas
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div>
            <h3 className="font-semibold mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Temp. Média</div>
                <div className="text-lg font-semibold">{insights.statistics.avg_temp.toFixed(1)}°C</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Umidade Média</div>
                <div className="text-lg font-semibold">{insights.statistics.avg_humidity.toFixed(0)}%</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Tendência</div>
                <div className="text-lg font-semibold capitalize">{insights.statistics.trend}</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Classificação</div>
                <div className="text-lg font-semibold capitalize">{insights.statistics.classification}</div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {insights.alerts && insights.alerts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Alertas</h3>
              <div className="space-y-2">
                {insights.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{alert.type}</span>
                      <span className="text-xs font-semibold uppercase">{alert.severity}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

