export interface ICreateWeatherLogDto {
  timestamp: number;
  location_name: string;
  temperature_c: number;
  wind_speed_kmh: number;
  weather_code: number;
  condition: string;
}

export interface IAggregationResult {
  _id: null;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  count: number;
}

export interface IWeatherInsight {
  period: string;
  average_temperature_c: number;
  max_temperature_c: number;
  min_temperature_c: number;
  data_points: number;
  classification: string;
  alert: string | null;
  summary_text: string;
}

export interface IWeatherLog {
  _id: string;
  timestamp: number;
  location_name: string;
  temperature_c: number;
  wind_speed_kmh: number;
  weather_code: number;
  condition: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedWeatherLogsResponse {
  pagina_atual: number;
  total_items: number;
  total_paginas: number;
  data: IWeatherLog[];
}

export interface ILogExport {
  _id: string;
  timestamp: number;
  location_name: string;
  temperature_c: number;
  wind_speed_kmh: number;
  weather_code: number;
  condition: string;
  createdAt: Date;
}

export interface IDailyTemperature {
  date: string;
  temp: number;
}

export interface IDailyAggregationResult {
  _id: string;
  avgTemp: number;
}
