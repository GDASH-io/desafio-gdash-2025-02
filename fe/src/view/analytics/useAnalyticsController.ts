import { useQuery } from "@/app/hooks/useQuery";
import { AnalyticsService } from "@/app/service/analytics";
import { useCallback, useState } from "react";

type AnalysticsFilters = {
  type: "hour" | "day";
  date?: Date;
  limit?: number;
};

export function useAnalyticsController() {
  const [temperatureFilters, setTemperatureFilters] =
    useState<AnalysticsFilters>({ type: "hour" });
  const [windFilters, setWindFilters] = useState<AnalysticsFilters>({
    type: "hour",
  });

  const [comparativeFilters, setComparativeFilters] =
    useState<AnalysticsFilters>({ type: "hour" });

  const temperatureFetcher = useCallback(() => {
    return AnalyticsService.getTemperatureAnalytics(temperatureFilters);
  }, [temperatureFilters]);

  const windFetcher = useCallback(() => {
    return AnalyticsService.getWindSpeedAnalytics(windFilters);
  }, [windFilters]);

  const comparativeFetcher = useCallback(() => {
    return AnalyticsService.getComparativeAnalytics(comparativeFilters);
  }, [comparativeFilters]);

  const windData = useQuery({
    fetcher: windFetcher,
  });

  const temperatureData = useQuery({
    fetcher: temperatureFetcher,
  });

  const comparativeData = useQuery({
    fetcher: comparativeFetcher,
  });

  return {
    windData,
    temperatureData,
    comparativeData,
    setWindFilters,
    setTemperatureFilters,
    setComparativeFilters,
    windFilters,
    temperatureFilters,
    comparativeFilters,
  };
}
