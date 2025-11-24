import { api } from './api';
import type {
  WeatherLog,
  WeatherLogsResponse,
  WeatherStatsResponse,
  WeatherFilters,
} from '../types/weather.types';

export const weatherService = {
  async getLogs(filters?: WeatherFilters): Promise<WeatherLogsResponse> {
    const response = await api.get<WeatherLogsResponse>('/weather/logs', {
      params: filters,
    });
    return response.data;
  },

  async getLatest(city?: string): Promise<WeatherLog | null> {
    const response = await api.get<WeatherLog | null>('/weather/latest', {
      params: city ? { city } : undefined,
    });
    return response.data;
  },

  async getStats(
    city?: string,
    startDate?: string,
    endDate?: string
  ): Promise<WeatherStatsResponse | null> {
    const response = await api.get<WeatherStatsResponse | null>('/weather/stats', {
      params: { city, startDate, endDate },
    });
    return response.data;
  },

  async exportCSV(): Promise<Blob> {
    const response = await api.get('/weather/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportXLSX(): Promise<Blob> {
    const response = await api.get('/weather/export/xlsx', {
      responseType: 'blob',
    });
    return response.data;
  },
};
