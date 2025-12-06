import api from "./api";
import {
  WeatherLog,
  WeatherStatistics,
  WeatherTrend,
  WeatherAlert,
  WeatherInsight,
  WeatherDashboard,
} from "@/types/weather";

export const weatherService = {
  async getLogs(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { data } = await api.get<{
      data: { logs: WeatherLog[]; total: number };
    }>("/weather/logs", { params });
    return data.data;
  },

  async getStatistics(params?: { startDate?: string; endDate?: string }) {
    const { data } = await api.get<{ data: WeatherStatistics }>(
      "/weather/statistics",
      { params }
    );
    return data.data;
  },

  async getTrends(params?: { startDate?: string; endDate?: string }) {
    const { data } = await api.get<{ data: WeatherTrend[] }>(
      "/weather/trends",
      { params }
    );
    return data.data;
  },

  async getAlerts() {
    const { data } = await api.get<{ data: WeatherAlert[] }>("/weather/alerts");
    return data.data;
  },

  async getInsights(params?: { regenerate?: boolean }) {
    const { data } = await api.get<{ data: WeatherInsight }>(
      "/weather/insights",
      { params }
    );
    return data.data;
  },

  async generateInsights() {
    const { data } = await api.post<{ data: WeatherInsight }>(
      "/weather/insights"
    );
    return data.data;
  },

  async getDashboard() {
    const { data } = await api.get<{ data: WeatherDashboard }>(
      "/weather/dashboard"
    );
    return data.data;
  },

  async exportCSV(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get("/weather/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async exportXLSX(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get("/weather/export/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
