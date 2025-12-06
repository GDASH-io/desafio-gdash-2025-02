export interface WeatherLog {
  id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  skyCondition: string;
  rainProbability: number;
  location: string;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherStatistics {
  temperature: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  humidity: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  windSpeed: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  rainProbability: {
    average: number;
    unit: string;
  };
  dataPointsAnalyzed: number;
  period: {
    start: string;
    end: string;
  };
}

export interface WeatherTrend {
  metric: "temperature" | "humidity" | "windSpeed" | "rainProbability";
  direction: "rising" | "falling" | "stable";
  changeRate: number;
  confidence: number;
  description: string;
}

export interface WeatherAlert {
  id?: string;
  type: "warning" | "info" | "danger";
  title: string;
  description: string;
  timestamp?: string;
}

export interface WeatherInsight {
  summary: string;
  trends: WeatherTrend[];
  alerts: WeatherAlert[];
  recommendations: string[];
  generatedAt: string;
}

export interface WeatherDashboard {
  generatedAt: string;
  location: string;
  period: {
    start: string | null;
    end: string | null;
  };
  recentLogs?: {
    data: WeatherLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  statistics?: WeatherStatistics;
  trends?: {
    trends: WeatherTrend[];
    summary: string;
  };
  alerts?: {
    active: WeatherAlert[];
    hasActiveAlerts: boolean;
  };
  comfort?: {
    score: number;
    classification: string;
    factors: {
      temperature: {
        value: number;
        contribution: number;
        status: string;
      };
      humidity: {
        value: number;
        contribution: number;
        status: string;
      };
      windSpeed: {
        value: number;
        contribution: number;
        status: string;
      };
    };
    recommendations: string[];
  };
  currentDay?: {
    classification: {
      id: string;
      classification: string;
      description: string;
      temperature: number;
      humidity: number;
      windSpeed: number;
    };
  };
}
