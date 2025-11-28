export interface WeatherInsights {
  timestamp: string;
  windowHours: number;
  metrics: {
    tempAvg?: number;
    humidityAvg?: number;
    windAvg?: number;
    precipSum?: number;
  };
  trend: {
    temperature: 'rising' | 'falling' | 'stable';
    delta?: number;
  };
  comfortScore?: number; // 0–100
  alerts: string[];
  summary: string;
}
