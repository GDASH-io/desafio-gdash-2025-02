import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";
import { WeatherLog } from "@/types/weather";

interface WeatherCardsProps {
  currentLog: WeatherLog | undefined;
}

export function WeatherCards({ currentLog }: WeatherCardsProps) {
  if (!currentLog) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhum dado climático disponível no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentLog.temperature.toFixed(1)}°C
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(currentLog.collectedAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Umidade</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentLog.humidity}%</div>
          <p className="text-xs text-muted-foreground">
            Umidade relativa do ar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vento</CardTitle>
          <Wind className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentLog.windSpeed.toFixed(1)} km/h
          </div>
          <p className="text-xs text-muted-foreground">Velocidade do vento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Condição</CardTitle>
          <CloudRain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold capitalize">
            {currentLog.skyCondition}
          </div>
          <p className="text-xs text-muted-foreground">
            🌧️ Chuva: {currentLog.rainProbability}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
