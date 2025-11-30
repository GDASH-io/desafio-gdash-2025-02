import {
  Calendar,
  Clock,
  Cloud,
  CloudRain,
  DownloadIcon,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { Activity } from "react";
import { WeatherCard } from "../../components/WeatherCard";
import { WeatherCardSkeleton } from "../../components/skeletons/WeatherCardSkeleton";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import InsightCard from "./components/InsightCard";
import InsightModal from "./components/InsigthModal";
import { useWeatherDetailDataController } from "./useWeatherDetailDataController";

function WeatherDetailedData() {
  const {
    isModalOpen,
    setIsModalOpen,
    data,
    isError,
    isLoading,
    exportCsvQuery,
    exportXlsxQuery,
  } = useWeatherDetailDataController();

  return (
    <div className="container mx-auto px-4 max-w-7xl bg-white">
      {data?.insight && (
        <>
          <InsightModal
            activities={data.insight.activities}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <InsightCard
            onOpenModal={() => setIsModalOpen(true)}
            description={data.insight.description}
            quantityOfActivities={data.insight.activities.length}
          />
        </>
      )}

      <Activity mode={!isError ? "visible" : "hidden"}>
        <div className="w-full flex flex-col gap-4 md:gap-0 md:flex-row justify-between items-center text-muted-foreground mb-6">
          <div className="w-fit flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{data?.data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{data?.data.hour}</span>
            </div>
          </div>

          <div className="w-fit flex items-center gap-2 md:gap-4">
            <Button size="sm" onClick={exportCsvQuery.refetch}>
              {exportCsvQuery.isLoading ? (
                <Spinner />
              ) : (
                <span className="text-sm flex gap-2 items-center">
                  <DownloadIcon /> CSV
                </span>
              )}
            </Button>

            <Button size="sm" onClick={exportXlsxQuery.refetch}>
              {exportXlsxQuery.isLoading ? (
                <Spinner />
              ) : (
                <span className="text-sm flex gap-2 items-center">
                  <DownloadIcon /> XLSX
                </span>
              )}
            </Button>
          </div>
        </div>
      </Activity>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <WeatherCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!data && !isLoading && (
        <div className="mb-8 text-lg">
          <h2>Sem dados disponíveis para o dia de hoje até o momento</h2>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
          <WeatherCard
            icon={Thermometer}
            title="Temperatura Atual"
            value={data.data.temperature_2m.value.toString()} 
            unit={data.data.temperature_2m.unit}
            description="Sensação térmica"
            variant="highlight"
          />
          <WeatherCard
            icon={Droplets}
            title="Umidade"
            value={data.data.relative_humidity_2m.value.toString()}
            unit={data.data.relative_humidity_2m.unit}
            description="Umidade relativa do ar"
          />

          <WeatherCard
            icon={Wind}
            title="Velocidade do Vento"
            value={data.data.wind_speed_10m.value.toString()}
            unit={data.data.wind_speed_10m.unit}
            description={`Direção: ${data.data.wind_direction_10m.value}°`}
          />

          <WeatherCard
            icon={CloudRain}
            title="Precipitação"
            value={data.data.precipitation.value.toString()}
            unit={data.data.precipitation.unit}
            description={`Probabilidade: ${data.data.precipitation_probability.value}%`}
          />

          <WeatherCard
            icon={Gauge}
            title="Pressão Atmosférica"
            value={data.data.pressure_msl.value.toString()}
            unit={data.data.pressure_msl.unit}
            description="Nível do mar"
          />

          <WeatherCard
            icon={Eye}
            title="Visibilidade"
            value={data.data.visibility.value.toString()}
            unit={data.data.visibility.unit}
            description="Condições de visibilidade"
          />

          <WeatherCard
            icon={Cloud}
            title="Cobertura de Nuvens"
            value={data.data.cloud_cover.value.toString()}
            unit={data.data.cloud_cover.unit}
            description="Parcialmente nublado"
          />

          <WeatherCard
            icon={Sun}
            title="Índice UV"
            value={data.data.uv_index.value.toString()}
            unit="UV Index"
            description="Exposição baixa ao sol"
          />
        </div>
      )}
    </div>
  );
}

export default WeatherDetailedData;
