import { httpClient } from "./httpClient";

interface WeatherResponse {
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

export const getWeather = async () => {
  const { data } = await httpClient.get<WeatherResponse>("/weather/latest", {
    params: {
      lat: -23.5475,
      lon: -46.63611,
    },
  });
  return data;
};
