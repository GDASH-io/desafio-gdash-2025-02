import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeatherStatistics } from "@/types/weather";

interface StatisticsCardProps {
  statistics: WeatherStatistics | undefined;
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  if (!statistics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas do Período</CardTitle>
        <CardDescription>
          {statistics.dataPointsAnalyzed} registros analisados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Temperatura
            </p>
            <p className="text-2xl font-bold">
              {statistics.temperature.average.toFixed(1)}°C
            </p>
            <p className="text-xs text-muted-foreground">
              Min: {statistics.temperature.min.toFixed(1)}°C | Max:{" "}
              {statistics.temperature.max.toFixed(1)}°C
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Umidade Média
            </p>
            <p className="text-2xl font-bold">
              {statistics.humidity.average.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Vento Médio
            </p>
            <p className="text-2xl font-bold">
              {statistics.windSpeed.average.toFixed(1)} km/h
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
