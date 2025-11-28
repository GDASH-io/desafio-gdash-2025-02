import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
const mockDownloadExport = vi.fn();

vi.mock('../lib/api', () => ({
    api: {
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
        delete: mockDelete,
    },
    authHeaders: () => ({}),
    downloadExport: mockDownloadExport,
}));

const sampleLogs = {
    logs: [
        {
            city: 'City A',
            temperatureC: 25,
            humidityPercent: 60,
            windSpeedKmh: 10,
            condition: 'sunny',
            collectedAt: '2024-01-01T00:00:00.000Z',
        },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
};

const sampleLocations = {
    locations: [
        { _id: 'loc1', name: 'City A', latitude: 1, longitude: 1, intervalMinutes: 60, active: true },
    ],
    total: 1,
    page: 1,
    limit: 5,
    totalPages: 1,
};

describe('useDashboard', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mockGet.mockImplementation((url, { params } = {} as any) => {
            if (url === '/weather/logs') {
                const limit = params?.limit ?? 10;
                return Promise.resolve({
                    data: { ...sampleLogs, limit, logs: sampleLogs.logs },
                });
            }
            if (url === '/locations') {
                return Promise.resolve({ data: sampleLocations });
            }
            if (url === '/config/collector') {
                return Promise.resolve({ data: { collectIntervalMinutes: 30 } });
            }
            if (url === '/weather/insights') {
                return Promise.resolve({ data: null });
            }
            if (url === '/weather/cities') {
                return Promise.resolve({ data: { cities: ['City A', 'City B'] } });
            }
            return Promise.resolve({ data: {} });
        });
        mockPost.mockResolvedValue({ data: { message: 'ok' } });
        mockPatch.mockResolvedValue({ data: {} });
        mockDelete.mockResolvedValue({ data: {} });
        mockDownloadExport.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('carrega logs, locais, cidades e configuracao iniciais', async () => {
        const mod = await import('./useDashboard');
        const { result, unmount } = renderHook(() => mod.useDashboard('token'));

        await act(async () => {
            await result.current.fetchAll();
        });
        expect(result.current.logs.length).toBe(1);
        expect(result.current.locations.length).toBe(1);
        expect(result.current.cities).toContain('City A');
        expect(result.current.collectConfig.collectIntervalMinutes).toBe(30);

        expect(mockGet).toHaveBeenCalledWith('/weather/logs', { headers: {}, params: { page: 1, limit: 10 } });
        expect(mockGet).toHaveBeenCalledWith('/locations', { headers: {}, params: { page: 1, limit: 5 } });
        expect(mockGet).toHaveBeenCalledWith('/weather/cities', { headers: {} });
        expect(mockGet).toHaveBeenCalledWith('/config/collector');
        expect(mockGet).toHaveBeenCalledWith('/weather/insights', { headers: {} });
        unmount();
    });

    it('realiza mutacoes principais (add/remover local, gerar insight, exportar, alterar configs)', async () => {
        const mod = await import('./useDashboard');
        const { result, unmount } = renderHook(() => mod.useDashboard('token'));

        await act(async () => {
            await result.current.fetchAll();
        });
        expect(result.current.logs.length).toBe(1);

        await act(async () => {
            await result.current.addLocation({ name: 'City B', latitude: 2, longitude: 2 });
        });
        expect(mockPost).toHaveBeenCalledWith(
            '/locations',
            { name: 'City B', latitude: 2, longitude: 2, intervalMinutes: 30, active: true },
            { headers: {} },
        );

        await act(async () => {
            await result.current.deleteLocation('loc1');
        });
        expect(mockDelete).toHaveBeenCalledWith('/locations/loc1', { headers: {} });

        await act(async () => {
            await result.current.generateAiInsights();
        });
        expect(mockPost).toHaveBeenCalledWith('/weather/insights', {}, { headers: {} });

        await act(async () => {
            result.current.exportData('csv');
        });
        expect(mockDownloadExport).toHaveBeenCalledWith('token', 'csv');

        await act(async () => {
            await result.current.changeInterval(15);
        });
        expect(mockPatch).toHaveBeenCalledWith('/config/collector', { collectIntervalMinutes: 15 }, { headers: {} });

        await act(async () => {
            await result.current.changePassword('old', 'new');
        });
        expect(mockPatch).toHaveBeenCalledWith('/users/me/password', { oldPassword: 'old', newPassword: 'new' }, { headers: {} });
        unmount();
    });
});
