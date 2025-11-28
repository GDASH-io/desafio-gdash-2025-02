export interface WeatherLogPublic {
  id: string;
  timestamp: Date;
  location: { latitude: number; longitude: number; geohash?: string };
  temperature2m: number;
  relativeHumidity2m: number;
  pressureMsl: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m?: number;
  precipitation: number;
  precipitationProbability?: number;
  cloudcover: number;
  weatherCode: number;
  units: {
    temperature2m: string;
    windSpeed10m: string;
    pressureMsl: string;
    precipitation: string;
    cloudcover: string;
    relativeHumidity2m: string;
  };
  fetchedAt: Date;
  source: string;
}

export interface ListLogsPublic {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  data: WeatherLogPublic[];
}
