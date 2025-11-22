import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  timestamp: string;
  createdAt: string;
}

export interface WeatherInsight {
  summary: string;
  trend: "up" | "down" | "stable";
  alert?: string;
  averageTemp: number;
}

export const getWeatherLogs = async (): Promise<WeatherLog[]> => {
  const response = await api.get<WeatherLog[]>("/weather/logs");
  return response.data;
};

export const getInsights = async (): Promise<WeatherInsight> => {
  const response = await api.get<WeatherInsight>("/weather/insights");
  return response.data;
};
