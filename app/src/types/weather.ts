export interface WeatherLog {
  id: string;
  cityName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitation: number;
  pressure?: number;
  visibility?: number;
  timestamp: string;
  createdAt: string;
}

export interface WeatherStatistics {
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  totalRecords: number;
  period: {
    start: string;
    end: string;
  };
}

export interface WeatherTrend {
  type: "increasing" | "decreasing" | "stable";
  metric: "temperature" | "humidity" | "windSpeed";
  change: number;
  description: string;
}

export interface WeatherAlert {
  id: string;
  type: "warning" | "info" | "danger";
  title: string;
  description: string;
  timestamp: string;
}

export interface WeatherInsight {
  summary: string;
  trends: WeatherTrend[];
  alerts: WeatherAlert[];
  recommendations: string[];
  generatedAt: string;
}

export interface WeatherDashboard {
  current: WeatherLog | null;
  recent: WeatherLog[];
  statistics: WeatherStatistics;
  insights: WeatherInsight | null;
}
