import { useCallback, useEffect, useRef, useState } from 'react';
import { api, authHeaders, downloadExport } from '../lib/api';

type WeatherRecord = {
    city: string;
    condition?: string;
    temperatureC: number;
    humidityPercent?: number;
    windSpeedKmh?: number;
    collectedAt: string;
};

type CityInsight = {
    city: string;
    averageTemperature: number;
    averageHumidity: number;
    trend: string;
    comfortIndex: number | null;
    alerts: string[];
    narrative: string;
    sampleCount: number;
    lastSample: WeatherRecord;
};

type Insights = {
    windowHours?: number;
    samples?: number;
    comfortRanking?: { city: string; comfortIndex: number | null; narrative: string }[];
    cities?: CityInsight[];
    message?: string;
    aiSummary?: string;
    model?: string;
    createdAt?: string;
};

type Location = {
    _id?: string;
    name: string;
    latitude: number;
    longitude: number;
    intervalMinutes: number;
    active: boolean;
};

type CollectorConfig = {
    collectIntervalMinutes: number;
};

const DEFAULT_INTERVAL = 60;

export function useDashboard(token: string | null) {
    const [logs, setLogs] = useState<WeatherRecord[]>([]);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [collectConfig, setCollectConfig] = useState<CollectorConfig>({ collectIntervalMinutes: DEFAULT_INTERVAL });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [logPage, setLogPage] = useState(1);
    const [logLimit] = useState(10);
    const [logTotalPages, setLogTotalPages] = useState(1);
    const [locationPage, setLocationPage] = useState(1);
    const [locationLimit] = useState(5);
    const [locationTotalPages, setLocationTotalPages] = useState(1);
    const [cities, setCities] = useState<string[]>([]);
    const [insightLogs, setInsightLogs] = useState<WeatherRecord[]>([]);
    const [insightCity, setInsightCity] = useState<string>('all');
    const [insightLogLimit] = useState(50);
    const [cityFilter, setCityFilter] = useState<string>('all');
    const logPageRef = useRef(logPage);
    const locationPageRef = useRef(locationPage);
    const cityFilterRef = useRef(cityFilter);
    const insightCityRef = useRef(insightCity);

    useEffect(() => {
        logPageRef.current = logPage;
    }, [logPage]);

    useEffect(() => {
        locationPageRef.current = locationPage;
    }, [locationPage]);

    useEffect(() => {
        cityFilterRef.current = cityFilter;
    }, [cityFilter]);

    useEffect(() => {
        insightCityRef.current = insightCity;
    }, [insightCity]);

    useEffect(() => {
        if (!cities.length) {
            setInsightCity('all');
            return;
        }
        setInsightCity((current) => {
            if (current === 'all' || cities.includes(current)) return current;
            return cities[0];
        });
    }, [cities]);

    const loadLogs = useCallback(
        async (page = 1, city?: string) => {
            if (!token) return;
            const params: Record<string, number | string> = { page, limit: logLimit };
            if (city && city !== 'all') {
                params.city = city;
            }
            const response = await api.get<{
                logs: WeatherRecord[];
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            }>('/weather/logs', { headers: authHeaders(token), params });
            setLogs(response.data.logs);
            setLogPage(response.data.page);
            setLogTotalPages(response.data.totalPages);
        },
        [token, logLimit]
    );

    const loadLocations = useCallback(
        async (page = 1) => {
            if (!token) return;
            const response = await api.get<{
                locations: Location[];
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            }>('/locations', { headers: authHeaders(token), params: { page, limit: locationLimit } });
            setLocations(response.data.locations);
            setLocationPage(response.data.page);
            setLocationTotalPages(response.data.totalPages);
        },
        [token, locationLimit]
    );

    const loadCities = useCallback(async () => {
        if (!token) return;
        const response = await api.get<{ cities: string[] }>('/weather/cities', { headers: authHeaders(token) });
        setCities(response.data.cities);
    }, [token]);

    const loadInsightLogs = useCallback(
        async (city = insightCityRef.current) => {
            if (!token) return;
            const params: Record<string, number | string> = { page: 1, limit: insightLogLimit };
            if (city && city !== 'all') {
                params.city = city;
            }
            const response = await api.get<{
                logs: WeatherRecord[];
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            }>('/weather/logs', { headers: authHeaders(token), params });
            setInsightLogs(response.data.logs);
        },
        [token, insightLogLimit]
    );

    const loadInsights = useCallback(async () => {
        if (!token) return null;
        const response = await api.get<Insights | null>('/weather/insights', { headers: authHeaders(token) });
        const value = response.data ?? null;
        setInsights(value);
        return value;
    }, [token]);

    const fetchAll = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!token) return;
            setLoading(true);
            try {
                await Promise.all([
                    loadLogs(logPageRef.current, cityFilterRef.current),
                    loadLocations(locationPageRef.current),
                    loadInsightLogs(insightCityRef.current)
                ]);
                const cfgResponse = await api.get<CollectorConfig>('/config/collector');
                await loadInsights();
                setCollectConfig(cfgResponse.data);
                if (!options?.silent) {
                    setStatus('Dados atualizados com sucesso');
                    setError('');
                }
            } catch {
                if (!options?.silent) {
                    setError('Erro ao carregar dados. Verifique a conexao e tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        },
        [token, loadLogs, loadLocations, loadInsightLogs, loadInsights]
    );

    useEffect(() => {
        if (token) {
            fetchAll();
        }
    }, [token, fetchAll]);

    useEffect(() => {
        if (token) {
            loadCities();
        }
    }, [token, loadCities]);

    useEffect(() => {
        if (!token) return;
        loadInsightLogs(insightCity);
    }, [token, insightCity, loadInsightLogs]);

    const generateAiInsights = useCallback(async () => {
        if (!token) return;
        setInsightsLoading(true);
        try {
            const response = await api.post<Insights>('/weather/insights', {}, { headers: authHeaders(token) });
            setInsights(response.data);
            setStatus('Insight de IA gerado com sucesso');
        } catch {
            setError('Erro ao gerar insight de IA.');
        } finally {
            setInsightsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        const intervalMinutes = collectConfig.collectIntervalMinutes || DEFAULT_INTERVAL;
        const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
        const id = setInterval(() => {
            fetchAll({ silent: true });
        }, intervalMs);
        return () => clearInterval(id);
    }, [token, collectConfig.collectIntervalMinutes, fetchAll]);

    useEffect(() => {
        if (!token) return;
        setLogPage(1);
        loadLogs(1, cityFilter);
    }, [cityFilter, loadLogs, token]);

    const addLocation = async (payload: { name: string; latitude: number; longitude: number }) => {
        if (!token) return;
        await api.post(
            '/locations',
            {
                ...payload,
                intervalMinutes: collectConfig.collectIntervalMinutes,
                active: true
            },
            { headers: authHeaders(token) }
        );
        await loadLocations(locationPage);
    };

    const deleteLocation = async (id?: string) => {
        if (!token || !id) return;
        await api.delete(`/locations/${id}`, { headers: authHeaders(token) });
        await loadLocations(locationPage);
    };

    const changeInterval = async (minutes: number) => {
        if (!token) return;
        await api.patch('/config/collector', { collectIntervalMinutes: minutes }, { headers: authHeaders(token) });
        setCollectConfig({ collectIntervalMinutes: minutes });
    };

    const changePassword = async (oldPass: string, newPass: string) => {
        if (!token) return;
        await api.patch(
            '/users/me/password',
            { oldPassword: oldPass, newPassword: newPass },
            { headers: authHeaders(token) }
        );
    };

    const exportData = (type: 'csv' | 'xlsx') => {
        if (!token) return;
        return downloadExport(token, type);
    };

    const goToLogPage = useCallback(
        async (page: number) => {
            await loadLogs(page, cityFilter);
        },
        [loadLogs, cityFilter]
    );

    const goToLocationPage = useCallback(
        async (page: number) => {
            await loadLocations(page);
        },
        [loadLocations]
    );

    return {
        logs,
        insights,
        insightsLoading,
        locations,
        collectConfig,
        loading,
        status,
        error,
        fetchAll,
        generateAiInsights,
        addLocation,
        deleteLocation,
        changeInterval,
        changePassword,
        exportData,
        setStatus,
        setError,
        cityFilter,
        setCityFilter,
        cities,
        insightCity,
        setInsightCity,
        insightLogs,
        logPagination: { page: logPage, totalPages: logTotalPages, limit: logLimit },
        locationPagination: {
            page: locationPage,
            totalPages: locationTotalPages,
            limit: locationLimit
        },
        goToLogPage,
        goToLocationPage
    };
}
