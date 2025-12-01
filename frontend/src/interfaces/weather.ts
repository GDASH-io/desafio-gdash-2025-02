export interface WeatherLog {
  id: number;
  timestamp: string;
  city: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  condition: string;
  raw: any;
  created_at: string;
}

export interface WeatherListResponse {
  count: number;
  next: string | null;
  previous: string | null;  
  results: WeatherLog[];
}

export interface WeatherInsight {
  id: number;
  generated_at: string;
  text: string;
  city?: string;
}

export interface WeatherInsightsResponse {
  days: number;
  city: string | null;
  count: number;
  insights: string;
  next: string | null;
  previous: string | null;
  data: WeatherInsight[];
}
