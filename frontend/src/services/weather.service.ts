import api from './api';
import type { WeatherLog, WeatherStats, PaginatedResponse } from '@/types';

export const weatherService = {
  async getLogs(page = 1, limit = 50): Promise<PaginatedResponse<WeatherLog>> {
    const { data } = await api.get<PaginatedResponse<WeatherLog>>('/weather/logs', {
      params: { page, limit },
    });
    return data;
  },

  async getLatest(limit = 10): Promise<WeatherLog[]> {
    const { data } = await api.get<WeatherLog[]>('/weather/logs/latest', {
      params: { limit },
    });
    return data;
  },

  async getStats(): Promise<WeatherStats> {
    const { data } = await api.get<WeatherStats>('/weather/stats');
    return data;
  },

  async exportCSV(): Promise<Blob> {
    const { data } = await api.get('/weather/export/csv', {
      responseType: 'blob',
    });
    return data;
  },

  async exportXLSX(): Promise<Blob> {
    const { data } = await api.get('/weather/export/xlsx', {
      responseType: 'blob',
    });
    return data;
  },
};