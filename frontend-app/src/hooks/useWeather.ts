import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/service/api';

export interface WeatherLog {
    id: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    collectedAt: string;
    location: { lat: number; lon: number };
}

export const useWeatherLogs = () => {
    const query = useQuery({
        queryKey: ['weather-logs'],
        queryFn: async () => {
            try {
                const { data } = await api.get<WeatherLog[]>('/weather/logs');
                return data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || "Erro ao buscar dados climáticos");
            }
        },
        refetchInterval: 5000, 
    });

    return {
        logs: query.data,
        loading: query.isLoading,
        error: query.error instanceof Error ? query.error.message : null,
        refetch: query.refetch
    };
};

export const useInsights = () => {
    const query = useQuery({
        queryKey: ['weather-insights'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/weather/logs/insights');
                return data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || "Erro ao gerar insights");
            }
        },
    });

    return {
        insights: query.data,
        loading: query.isLoading,
        error: query.error instanceof Error ? query.error.message : null,
    };
};

export const useExportLogs = () => {
    const mutation = useMutation({
        mutationFn: async (type: 'csv' | 'xlsx') => {
            try {
                const response = await api.get(`/weather/logs/export/${type}`, {
                    responseType: 'blob', 
                });
                
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `clima_logs.${type}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                return true;
            } catch (error: any) {
                throw new Error("Erro ao exportar arquivo");
            }
        },
    });

    return {
        exportLogs: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error instanceof Error ? mutation.error.message : null,
    };
};