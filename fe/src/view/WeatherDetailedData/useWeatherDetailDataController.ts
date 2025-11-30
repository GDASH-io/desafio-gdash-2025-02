import { useQuery } from "@/app/hooks/useQuery";
import { WeatherService } from "@/app/service/weather";
import { useState } from "react";

export function useWeatherDetailDataController() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, isError, isLoading } = useQuery({
      fetcher: WeatherService.getWeather,
    });
  
    const exportCsvQuery = useQuery({
      fetcher: WeatherService.exportWeathersToCsv,
      enabled: false,
    });
  
    const exportXlsxQuery = useQuery({
      fetcher: WeatherService.exportWeathersToXlsx,
      enabled: false,
    });

    return {
      isModalOpen,
      setIsModalOpen,
      data,
      isError,
      isLoading,
      exportCsvQuery,
      exportXlsxQuery,
      
    }
}