import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeatherLog } from "@/interfaces/weather";

interface WeatherSummaryCardsProps {
  log: WeatherLog | null;
}

export function WeatherSummaryCards({ log }: WeatherSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Temperatura atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {log ? `${log.temperature.toFixed(1)} °C` : "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Umidade atual</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {log ? `${log.humidity.toFixed(0)} %` : "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Velocidade do vento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {log ? `${log.wind_speed.toFixed(1)} km/h` : "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Condição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            {log ? log.condition : "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
