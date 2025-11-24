import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import type {
  WeatherListResponse,
  WeatherInsightsResponse,
} from "@/interfaces/weather";

const AUTH_TOKEN_KEY = "authToken";

const weatherApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

weatherApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const firstValue = data.errors[firstKey];
      if (Array.isArray(firstValue)) return firstValue[0];
      if (typeof firstValue === "string") return firstValue;
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof error.message === "string") return error.message;
  }

  return "Ocorreu um erro na requisição.";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function listWeatherLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<WeatherListResponse> {
  try {
    const { data } = await weatherApi.get<WeatherListResponse>("/weather/logs/", {
      params,
    });
    console.log("Fetched weather logs:", data);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getWeatherInsights(params?: {
  days?: number;
  limit?: number;
  offset?: number;
}): Promise<WeatherInsightsResponse> {
  try {
    const { data } = await weatherApi.get<WeatherInsightsResponse>(
      "/weather/logs/insights/",
      { params }
    );
    console.log("Fetched weather insights:", data);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function exportWeatherCsv(params?: {
  limit?: number;
  offset?: number;
}): Promise<void> {
  try {
    const response = await weatherApi.get("/weather/logs/export.csv", {
      params,
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"];
    let filename = "weather_logs.csv";
    if (disposition && typeof disposition === "string") {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    downloadBlob(response.data, filename);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function exportWeatherXlsx(params?: {
  limit?: number;
  offset?: number;
}): Promise<void> {
  try {
    const response = await weatherApi.get("/weather/logs/export.xlsx", {
      params,
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"];
    let filename = "weather_logs.xlsx";
    if (disposition && typeof disposition === "string") {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    downloadBlob(response.data, filename);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export const weatherService = {
  listWeatherLogs,
  getWeatherInsights,
  exportWeatherCsv,
  exportWeatherXlsx,
};
