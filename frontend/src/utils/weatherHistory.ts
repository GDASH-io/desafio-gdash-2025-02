export interface WeatherHistoryPoint {
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
export const formatChartTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
