import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeatherLogs } from '../useWeatherLogs';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  getWeatherLogsPaginated: vi.fn(),
}));

describe('useWeatherLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useWeatherLogs());

    expect(result.current.logs).toEqual([]);
    expect(result.current.pagination).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch logs successfully', async () => {
    const mockData = {
      data: [
        {
          _id: '1',
          timestamp: '2025-01-24T10:00:00Z',
          temperature: 25,
          humidity: 70,
          city: 'São Paulo',
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    vi.mocked(api.getWeatherLogsPaginated).mockResolvedValue(mockData);

    const { result } = renderHook(() => useWeatherLogs());

    await act(async () => {
      await result.current.fetchLogs(1, 10);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.pagination).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.getWeatherLogsPaginated).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useWeatherLogs());

    await act(async () => {
      await result.current.fetchLogs(1, 10);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.logs).toEqual([]);
    expect(result.current.pagination).toBeNull();
  });
});

