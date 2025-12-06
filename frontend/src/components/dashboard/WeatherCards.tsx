import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Cloud } from "lucide-react";
import { WeatherLog } from "@/services/weather";
import { getWeatherIcon, getWeatherLabel } from "@/utils/weatherUtils";

interface WeatherCardsProps {
  latestLog: WeatherLog;
}

export function WeatherCards({ latestLog }: WeatherCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestLog.current.temperature.toFixed(1)}°C
          </div>
          <p className="text-xs text-muted-foreground">
            {getWeatherIcon(latestLog.current.weather_code)}{" "}
            {getWeatherLabel(latestLog.current.weather_code)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Umidade</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestLog.current.humidity.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {latestLog.current.humidity > 70
              ? "Alta"
              : latestLog.current.humidity < 40
              ? "Baixa"
              : "Normal"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Velocidade do Vento</CardTitle>
          <Wind className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestLog.current.wind_speed.toFixed(1)} km/h
          </div>
          <p className="text-xs text-muted-foreground">
            {latestLog.current.wind_speed > 20
              ? "Forte"
              : latestLog.current.wind_speed > 10
              ? "Moderado"
              : "Leve"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Condição</CardTitle>
          <Cloud className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getWeatherIcon(latestLog.current.weather_code)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getWeatherLabel(latestLog.current.weather_code)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

