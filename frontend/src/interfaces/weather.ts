export interface WeatherLog {
  id: number;
  collected_at: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  rain_probability: number;
  source: string;
}

export interface WeatherListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WeatherLog[];
}

export interface WeatherInsightsResponse {
  days: number;
  count: number;
  insights: string;
  data: WeatherLog[];
}
