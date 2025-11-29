export interface WeatherLog {
  _id: string;
  latitude: string;
  longitude: string;
  temp_c: number;
  humidity: number;
  wind_speed: number;
  condition_code: number;
  rain_prob: number;
  collected_at: number;
  createdAt: string;
}

export interface WeatherStats {
  current?: WeatherLog;
  history: WeatherLog[];
}