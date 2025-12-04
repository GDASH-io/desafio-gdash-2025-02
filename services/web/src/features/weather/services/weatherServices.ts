import { apiClient } from "@/lib/api-client";
import { InsightsResponse, weatherListResponse } from "../types";

export const weatherService = {
    getLogs: async (params?: {
        page?: number;
        limit?: number;
        city?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<weatherListResponse> => {
        const response = await apiClient.get<weatherListResponse>('/api/v1/weather/logs', {
            params,
        });
        return response.data;
    },

    getInsights: async (params?: {
        city?: string;
        period?: '24h' | '7d' | '30d';
        startDate?: string;
        endDate?: string;
    }): Promise<InsightsResponse> => {
        const response = await apiClient.get<InsightsResponse>('/api/v1/weather/insights', {
            params: {
                period: params?.period || '7d',
                ...params,
            },
        });
        return response.data
    },

    exportCSV: async (params?: { city?: string; startDate?: string; endDate?: string }) => {
        const response = await apiClient.get('/api/v1/weather/export/csv', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },

    exportXLSX: async (params?: { city?: string; startDate?: string; endDate?: string }) => {
        const response = await apiClient.get('/api/v1/weather/export/xlsx', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },
};