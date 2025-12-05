import * as React from "react";
import { useAuth } from "../hooks/useAuth";
import { AxiosError } from "axios";
import type {
  IWeatherContext,
  IWeatherInsights,
  IWeatherLog,
  IPaginatedWeatherLogsResponse,
} from "../interfaces/weather.interface";
import api from "../service/api";
import { WeatherContext } from "./weatherContextDefinition";
import type { IDailyTemperature } from "../interfaces/charts.interface";

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout, token } = useAuth();
  const [logs, setLogs] = React.useState<IWeatherLog[]>([]);
  const [insights, setInsights] = React.useState<IWeatherInsights | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [dailyTemps, setDailyTemps] = React.useState<IDailyTemperature[]>([]);

  const fetchWeatherData = React.useCallback(
    async (page: number = 1) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const logsResponse = await api.get<IPaginatedWeatherLogsResponse>(
          `/weather/logs?page=${page}`
        );
        const logsData = logsResponse.data;
        setLogs(logsData.data);
        setCurrentPage(logsData.pagina_atual);
        setTotalPages(logsData.total_paginas);
        setTotalItems(logsData.total_items);

        const insightsResponse = await api.get<IWeatherInsights>(
          "/weather/insights"
        );
        setInsights(insightsResponse.data);

        const dailyTempsResponse = await api.get<IDailyTemperature[]>(
          "/weather/daily-temps"
        );
        setDailyTemps(dailyTempsResponse.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Falha ao carregar dados. Verifique a conexão com o Backend.");
        if ((err as AxiosError).response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [token, logout]
  );

  React.useEffect(() => {
    fetchWeatherData(1);
  }, [fetchWeatherData]);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchWeatherData(page);
    }
  };

  const contextValue: IWeatherContext = {
    logs,
    insights,
    isLoading,
    error,
    fetchWeatherData: () => fetchWeatherData(currentPage),
    currentPage,
    totalPages,
    totalItems,
    changePage,
    dailyTemps,
  };

  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
};
