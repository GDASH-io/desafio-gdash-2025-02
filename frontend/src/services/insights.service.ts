import api from './api';

export interface WeatherInsight {
  timeRange: string;
  metrics: {
    averageTemperature: number;
    averageHumidity: number;
    averageWindSpeed: number;
    averageRainProbability: number;
    minTemperature: number;
    maxTemperature: number;
    trend: 'rising' | 'falling' | 'stable';
  };
  classification: string;
  comfortScore: number;
  summaryText: string;
  alerts: string[];
}

export const insightsService = {
  getWeatherInsights: async (
    timeRange: '24h' | '7d' | '30d' = '24h',
    city?: string,
  ): Promise<WeatherInsight> => {
    const response = await api.get<WeatherInsight>('/insights/weather', {
      params: { timeRange, city },
    });
    return response.data;
  },
};

