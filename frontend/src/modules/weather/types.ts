export interface WeatherResponse {
  _id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_description: string;
  rain_probability: number;
  fetched_at: string;
}

export interface PaginatedWeatherResponse {
  data: WeatherResponse[];
  page: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

export interface WeatherFilters {
  page?: number;
  itemsPerPage?: number;
  startDate?: string;
  endDate?: string;
}
