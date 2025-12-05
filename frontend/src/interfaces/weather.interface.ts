import type { IDailyTemperature } from "./charts.interface";

export interface IWeatherLog {
  _id: string;
  location_name: string;
  temperature_c: number;
  wind_speed_kmh: number;
  condition: string;
  createdAt: string;
}

export interface IWeatherInsights {
  period: string;
  average_temperature_c: number;
  max_temperature_c: number;
  min_temperature_c: number;
  data_points: number;
  classification: string;
  alert: string | null;
  summary_text: string;
}

export interface IPaginatedWeatherLogsResponse {
  pagina_atual: number;
  total_items: number;
  total_paginas: number;
  data: IWeatherLog[];
}

export interface IWeatherContext {
  logs: IWeatherLog[];
  insights: IWeatherInsights | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  changePage: (page: number) => void;
  fetchWeatherData: (page?: number) => Promise<void>;
  dailyTemps: IDailyTemperature[];
}
