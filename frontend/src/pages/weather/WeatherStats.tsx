import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";
import type { WeatherResponse } from "@/modules/weather/types";

interface WeatherStatsProps {
  data: WeatherResponse[];
}

export function WeatherStats({ data }: WeatherStatsProps) {
  const latest = data[0];

  const avgTemp =
    data.reduce((acc, item) => acc + item.temperature, 0) / data.length;
  const avgHumidity =
    data.reduce((acc, item) => acc + item.humidity, 0) / data.length;
  const avgWindSpeed =
    data.reduce((acc, item) => acc + item.wind_speed, 0) / data.length;
  const avgRainProb =
    data.reduce((acc, item) => acc + item.rain_probability, 0) / data.length;

  const stats = [
    {
      label: "Temperatura Média",
      value: `${avgTemp.toFixed(1)}°C`,
      icon: Thermometer,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      latest: latest ? `${latest.temperature}°C` : undefined,
    },
    {
      label: "Umidade Média",
      value: `${avgHumidity.toFixed(1)}%`,
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      latest: latest ? `${latest.humidity}%` : undefined,
    },
    {
      label: "Velocidade do Vento Média",
      value: `${avgWindSpeed.toFixed(1)} km/h`,
      icon: Wind,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
      latest: latest ? `${latest.wind_speed} km/h` : undefined,
    },
    {
      label: "Probabilidade de Chuva Média",
      value: `${avgRainProb.toFixed(1)}%`,
      icon: CloudRain,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      latest: latest ? `${latest.rain_probability}%` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="shadow-lg border-2 hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.latest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Mais recente: {stat.latest}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
