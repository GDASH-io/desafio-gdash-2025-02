import { httpClient } from "./httpClient";

interface WeatherHistoryResponse {
  temperatureC: number;
  windSpeedMs: number;
  windDirection: number;
  humidity: number | null;
  lat: number;
  lon: number;
  createdAt: string;
  raw: {
    current_weather: {
      weathercode: number;
    };
  };
}

export const getWeatherHistory = async () => {
  const { data } = await httpClient.get<WeatherHistoryResponse[]>("/weather");
  return data;
};
