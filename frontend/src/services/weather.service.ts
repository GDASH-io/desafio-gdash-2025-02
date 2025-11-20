import api from './api';

export interface WeatherLog {
  _id: string;
  city: string;
  timestamp: string;
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  condition: string;
  rainProbability: number;
  createdAt: string;
}

export interface WeatherLogsResponse {
  data: WeatherLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterWeatherLogs {
  city?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const weatherService = {
  getLogs: async (filters: FilterWeatherLogs = {}): Promise<WeatherLogsResponse> => {
    const response = await api.get<WeatherLogsResponse>('/weather/logs', { params: filters });
    return response.data;
  },
  getLatest: async (city?: string): Promise<WeatherLog> => {
    const response = await api.get<WeatherLog>('/weather/logs/latest', { params: { city } });
    return response.data;
  },
  exportCsv: async (filters: FilterWeatherLogs = {}): Promise<Blob> => {
    const response = await api.get('/weather/export.csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
  exportXlsx: async (filters: FilterWeatherLogs = {}): Promise<Blob> => {
    const response = await api.get('/weather/export.xlsx', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

