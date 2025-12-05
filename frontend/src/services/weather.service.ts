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
  visibility?: number;
  solarRadiation?: number;
  windDirection?: number;
  pressure?: number;
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
  analysis: string;
  activitySuggestions: string[];
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

  async getInsights(): Promise<WeatherInsights> {
    const response = await api.get<WeatherInsights>('/api/weather/insights');
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

  async collectWeatherData(): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await api.post<{ success: boolean; message: string; data?: any }>('/api/weather/collect');
    return response.data;
  },
};

