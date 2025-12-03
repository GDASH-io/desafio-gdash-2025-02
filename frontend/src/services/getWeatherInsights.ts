import { httpClient } from "./httpClient";

interface WeatherInsightsResponse {
  resumo: string;
  tendencias: [];
  alertas: [];
  previsao_qualitativa: string;
}

export const getWeatherInsights = async () => {
  const { data } = await httpClient.get<WeatherInsightsResponse>(
    "/weather/insights"
  );

  return data;
};
