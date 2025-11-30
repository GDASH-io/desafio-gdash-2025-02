import { useQuery } from "@/app/hooks/useQuery";
import { WeatherService } from "@/app/service/weather";
import {
  Calendar,
  Clock,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
} from "lucide-react";
import { Activity } from "react";
import { WeatherSummaryCard } from "../../components/WeatherSummaryCard";
import { WeatherSummaryCardSkeleton } from "../../components/skeletons/WeatherSummaryCardSkeleton";

function Main() {
  const { data, isError, isLoading } = useQuery({
    fetcher: WeatherService.getWeather,
  });

  return (
    <div className="w-full px-6">
      <Activity mode={!isError ? "visible" : "hidden"}>
        <div className="flex items-center gap-4 text-muted-foreground mb-10">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{data?.data.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{data?.data.hour}</span>
          </div>
        </div>
      </Activity>
      {isLoading && (
        <div className="mb-8">
          <WeatherSummaryCardSkeleton />
        </div>
      )}

      {!data && !isLoading && (
        <div className="mb-8 text-lg">
          <h2>Sem dados disponíveis para o dia de hoje até o momento</h2>
        </div>
      )}

      {/* Weather Summary Card */}
      {data && (
        <div className="pb-2">
          <WeatherSummaryCard
            metrics={[
              {
                icon: Thermometer,
                label: "Temperatura",
                value: data.data.temperature_2m.value,
                unit: data.data.temperature_2m.unit,
              },
              {
                icon: Droplets,
                label: "Umidade",
                value: data.data.relative_humidity_2m.value,
                unit: data.data.relative_humidity_2m.unit,
              },
              {
                icon: Wind,
                label: "Vento",
                value: data.data.wind_speed_10m.value,
                unit: data.data.wind_speed_10m.unit,
              },
              {
                icon: CloudRain,
                label: "Precipitação",
                value: data.data.precipitation.value,
                unit: data.data.precipitation.unit,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default Main;
