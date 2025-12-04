import { useQuery } from "@tanstack/react-query";
import { weatherService } from "../services/weatherServices";

export const useWeatherLogs = (params?: {
    page?: number;
    limit?: number;
    city?: string;
}) => {
    return useQuery({
        queryKey: ['weather-logs', params],
        queryFn: () => weatherService.getLogs(params),
        refetchInterval: 60000,
    });
};

export const useWeatherInsights = (params?: {
    city?: string;
    period?: '24h' | '7d' | '30d';
}) => {
    return useQuery({
        queryKey: ['weather-insights', params],
        queryFn: () => weatherService.getInsights(params),
        refetchInterval: 300000,
    });
};

export const useExportWeather = () => {
    const exportCSV = async (params?: { city?: string }) => {
        const blob = await weatherService.exportCSV(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const exportXLSX = async (params?: { city?: string }) => {
        const blob = await weatherService.exportXLSX(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-data-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return { exportCSV, exportXLSX };
};