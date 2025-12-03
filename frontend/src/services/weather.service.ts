import { api } from './api';

export interface WeatherLog {
  _id: string;
  timestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainProbability: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherLogsResponse {
  data: WeatherLog[];
  total: number;
  page: number;
  limit: number;
}

export interface WeatherInsights {
  summary: string;
  trends: string;
  alerts: string[];
  comfortScore: number;
  classification: string;
}

export const weatherService = {
  async getLogs(page = 1, limit = 50, location?: string): Promise<WeatherLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (location) params.append('location', location);

    const response = await api.get<WeatherLogsResponse>(`/api/weather/logs?${params}`);
    return response.data;
  },

  async getInsights(days = 7): Promise<WeatherInsights> {
    const response = await api.get<WeatherInsights>(`/api/weather/insights?days=${days}`);
    return response.data;
  },

  async exportCsv(): Promise<Blob> {
    const response = await api.get('/api/weather/export.csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportXlsx(): Promise<Blob> {
    const response = await api.get('/api/weather/export.xlsx', {
      responseType: 'blob',
    });
    return response.data;
  },
};

