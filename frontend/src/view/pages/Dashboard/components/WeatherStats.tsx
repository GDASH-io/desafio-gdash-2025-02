import { convertLatLonToCity } from "@/utils/convertLatLonToCity";
import { getRainProbability } from "@/utils/rainProbability";
import {
  Clock,
  CloudRain,
  Droplets,
  MapPin,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WeatherCard } from "./WeatherCard";

interface WeatherData {
  temperatureC: number;
  windSpeedMs: number;
  windDirection: number;
  lat: number;
  lon: number;
  humidity: number | null;
  createdAt: string;
  raw: {
    current_weather: {
      weathercode: number;
    };
  };
}

interface WeatherStatsProps {
  data: WeatherData;
}

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const WeatherStats = ({ data }: WeatherStatsProps) => {
  const weatherCode = data.raw.current_weather.weathercode;
  const rainInfo = getRainProbability(weatherCode);
  const [cityName, setCityName] = useState<string>("Carregando...");
  useEffect(() => {
    async function loadCity() {
      const name = await convertLatLonToCity(data.lat, data.lon);

      setCityName(name);
    }

    loadCity();
  }, [data.lat, data.lon]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WeatherCard
        title="Temperatura"
        value={data.temperatureC}
        unit="°C"
        icon={Thermometer}
        description="Temperatura atual"
      />

      <WeatherCard
        title="Velocidade do Vento"
        value={data.windSpeedMs}
        unit="km/h"
        icon={Wind}
        description="Velocidade em tempo real"
      />

      <WeatherCard
        title="Umidade"
        value={`${data.humidity}%`}
        icon={Droplets}
        description="Umidade atual"
      />

      <WeatherCard
        title="Localização"
        value={cityName}
        icon={MapPin}
        description={`${data.lat}°/${data.lon}°`}
      />

      <WeatherCard
        title="Última Atualização"
        value={formatDate(data.createdAt)}
        icon={Clock}
        description="Data e hora"
      />

      <WeatherCard
        title="Probabilidade de chuva"
        value={`${rainInfo.percentage}%`}
        icon={CloudRain}
        description={rainInfo.description}
      />
    </div>
  );
};
