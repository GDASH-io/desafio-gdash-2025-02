export interface WeatherLog {
  _id?: string;
  timestamp: string;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainProbability: number;
}

export interface WeatherInsights {
  avgTemp: number;
  avgHum: number;
  avgWind: number;
  trendText: string;
  text: string;

  // novos campos vindos do backend
  comfortScore?: number;
  classification?: string;
  rainHighRatio?: number;
  alerts?: string[];
}


export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
