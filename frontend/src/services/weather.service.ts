import api from '../lib/api';

export interface WeatherLog {
  _id: string;
  timestamp: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  weatherCode?: number;
  condition: string;
  precipitationProbability?: number;
}

export interface WeatherInsights {
  summary: string;
  statistics: {
    averageTemperature: number | null;
    averageHumidity: number | null;
    averageWindSpeed: number | null;
    totalRecords: number;
  };
  trends: {
    temperature: string;
  };
  comfort: {
    score: number;
    classification: string;
  };
  alerts: string[];
  latest: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    condition: string;
    timestamp: string;
    precipitationProbability?: number;
  };
}

export const weatherService = {
  async getLogs(limit = 100, skip = 0): Promise<WeatherLog[]> {
    const response = await api.get<WeatherLog[]>('/api/weather/logs', {
      params: { limit, skip },
    });
    return response.data;
  },

  async getInsights(): Promise<WeatherInsights> {
    const response = await api.get<WeatherInsights>('/api/weather/insights');
    return response.data;
  },

  async exportCSV(): Promise<void> {
    const response = await api.get('/api/weather/export.csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'weather_logs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportXLSX(): Promise<void> {
    const response = await api.get('/api/weather/export.xlsx', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'weather_logs.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

