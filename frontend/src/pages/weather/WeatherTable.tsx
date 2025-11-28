import type { WeatherResponse } from "@/modules/weather/types";
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

interface WeatherTableProps {
  data: WeatherResponse[];
}

export function WeatherTable({ data }: WeatherTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              Data/Hora
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Temperatura
              </div>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Umidade
              </div>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-500" />
                Vento
              </div>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-purple-500" />
                Prob. Chuva
              </div>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              Condição
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item._id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-4 px-4 text-sm">
                {formatDate(item.fetched_at)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.temperature}°C</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold">{item.humidity}%</span>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold">{item.wind_speed} km/h</span>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold">{item.rain_probability}%</span>
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {item.weather_description}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
