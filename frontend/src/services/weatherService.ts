import apiClient from './apiClient';

export interface WeatherLogPublic {
  id: string;
  timestamp: string;
  location: { latitude: number; longitude: number; geohash?: string };
  temperature2m: number;
  relativeHumidity2m: number;
  pressureMsl: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m?: number;
  precipitation: number;
  precipitationProbability?: number;
  cloudcover: number;
  weatherCode: number;
  units: {
    temperature2m: string;
    windSpeed10m: string;
    pressureMsl: string;
    precipitation: string;
    cloudcover: string;
    relativeHumidity2m: string;
  };
  source: string;
  fetchedAt: string;
}

export interface ListLogsPublic {
  data: WeatherLogPublic[];
  page: number;
  limit: number;
  total: number;
  hasNext?: boolean;
}

export interface WeatherInsights {
  timestamp: string;
  windowHours: number;
  metrics: {
    tempAvg?: number;
    humidityAvg?: number;
    windAvg?: number;
    precipSum?: number;
  };
  trend: { temperature: 'rising' | 'falling' | 'stable'; delta?: number };
  comfortScore?: number;
  alerts: string[];
  summary: string;
}

export const weatherService = {
  async listLogs(params: { page?: number; limit?: number; from?: string; to?: string }): Promise<ListLogsPublic> {
    const { page, limit, from, to } = params || {};
    const res = await apiClient.get<ListLogsPublic>('/weather/logs', {
      params: { page, limit, from, to },
    });
    return res.data;
  },

  async getInsights(params?: { windowHours?: number }): Promise<WeatherInsights> {
    const res = await apiClient.get<WeatherInsights>('/weather/insights', {
      params: { windowHours: params?.windowHours },
    });
    return res.data;
  },

  async exportCsv(params?: { from?: string; to?: string; limit?: number }): Promise<Blob> {
    const res = await apiClient.get('/weather/export.csv', {
      params,
      responseType: 'blob',
    });
    return res.data as Blob;
  },

  async exportXlsx(params?: { from?: string; to?: string; limit?: number }): Promise<Blob> {
    const res = await apiClient.get('/weather/export.xlsx', {
      params,
      responseType: 'blob',
    });
    return res.data as Blob;
  },
};

export default weatherService;

