import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { WeatherInsights } from "../../services/weatherService";

interface Props {
  insights?: WeatherInsights;
  loading?: boolean;
  error?: string;
}

export function InsightsPanel({ insights, loading, error }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights de IA</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-500">Carregando insights…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && insights && (
          <div className="space-y-2">
            <div className="text-sm text-gray-700">{insights.summary}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Médias ({insights.windowHours}h)</div>
                <ul className="mt-1 space-y-1">
                  {insights.metrics.tempAvg !== undefined && (
                    <li>Temperatura: {insights.metrics.tempAvg.toFixed(1)} °C</li>
                  )}
                  {insights.metrics.humidityAvg !== undefined && (
                    <li>Umidade: {insights.metrics.humidityAvg.toFixed(0)} %</li>
                  )}
                  {insights.metrics.windAvg !== undefined && (
                    <li>Vento: {insights.metrics.windAvg.toFixed(1)} km/h</li>
                  )}
                  {insights.metrics.precipSum !== undefined && (
                    <li>Chuva acumulada: {insights.metrics.precipSum.toFixed(1)} mm</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium">Tendência</div>
                <div className="mt-1">Temperatura: {insights.trend.temperature}</div>
                {insights.trend.delta !== undefined && (
                  <div>Delta: {insights.trend.delta.toFixed(2)} °C</div>
                )}
                {insights.comfortScore !== undefined && (
                  <div className="mt-2">Conforto: {insights.comfortScore}/100</div>
                )}
              </div>
            </div>
            {insights.alerts.length > 0 && (
              <div>
                <div className="font-medium">Alertas</div>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {insights.alerts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
