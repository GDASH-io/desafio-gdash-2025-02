export interface WeatherLog {
  _id: string;
  timestamp: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  condition: string;
  rainProbability: number;
  cloudCover: number;
  source?: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherLogsResponse {
  data: WeatherLog[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface WeatherStatsResponse {
  _id: null;
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  totalRecords: number;
}

export interface WeatherFilters {
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
