export interface Location {
    latitude: number;
    longitude: number;
    city: string
}

export interface WeatherLog{
    id: string;
    timestamp: string;
    location: Location;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    cloudCover: number;
    weatherCode: number;
    createdAt: string;
    updatedAt: string;
}

export interface weatherListResponse {
    data: WeatherLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface WeatherStatistics {
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    avgHumidity: number;
    avgWindSpeed: number;
    totalRecords: number;
}

export interface AIInsights {
    summary: string;
    trends: string[];
    alerts: Array<{ type: 'warning' | 'info'; message: string }>;
    comfortScore: number;
    recommendations: string[];
    generatedAt: string;
}

export interface InsightsResponse {
    filters: {
        city?: string;
        period: string;
        startDate: Date;
        endDate: Date;
    };
    statistics: WeatherStatistics;
    insights: AIInsights;
}