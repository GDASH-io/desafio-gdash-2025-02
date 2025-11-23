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

export interface SpacexLaunch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  details: string | null;
  rocket: {
    name: string;
  };
}

export interface SpacexResponse {
  data: SpacexLaunch[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

export const getWeatherLogs = async (): Promise<WeatherLog[]> => {
  const response = await api.get<WeatherLog[]>("/weather/logs");
  return response.data;
};

export const getInsights = async (): Promise<WeatherInsight> => {
  const response = await api.get<WeatherInsight>("/weather/insights");
  return response.data;
};

export const getSpacexLaunches = async (
  page = 1,
  limit = 10
): Promise<SpacexResponse> => {
  const response = await api.get<SpacexResponse>("/spacex/launches", {
    params: { page, limit },
  });
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/profile");
  return response.data;
};

export const getUsers = async (): Promise<UserProfile[]> => {
  const response = await api.get<UserProfile[]>("/users");
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (data: Partial<UserProfile>) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

export const deleteUser = async () => {
  const response = await api.delete("/users/profile");
  return response.data;
};
