import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeatherFilters } from '../useWeatherFilters';

describe('useWeatherFilters', () => {
  const mockFetchLogs = vi.fn().mockResolvedValue(undefined);
  const mockPagination = {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasPreviousPage: false,
    hasNextPage: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.cityFilter).toBe('');
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
    expect(result.current.goToPageInput).toBe('');
  });

  it('should update city filter', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setCityFilter('São Paulo');
    });

    expect(result.current.cityFilter).toBe('São Paulo');
  });

  it('should update date filters', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });

    expect(result.current.startDate).toBe('2025-01-01');
    expect(result.current.endDate).toBe('2025-01-31');
  });

  it('should apply filters and reset page to 1', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setPage(5);
      result.current.setCityFilter('São Paulo');
      result.current.setStartDate('2025-01-01');
    });

    await act(async () => {
      result.current.applyFilters();
    });

    expect(result.current.page).toBe(1);
    expect(mockFetchLogs).toHaveBeenCalledWith(1, 10, 'São Paulo', '2025-01-01', undefined);
  });

  it('should clear filters', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setCityFilter('São Paulo');
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });

    await act(async () => {
      result.current.clearFilters();
    });

    expect(result.current.cityFilter).toBe('');
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
    expect(result.current.page).toBe(1);
    expect(mockFetchLogs).toHaveBeenCalledWith(1, 10);
  });

  it('should handle page change', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    await act(async () => {
      result.current.handlePageChange(3);
    });

    expect(result.current.page).toBe(3);
    expect(mockFetchLogs).toHaveBeenCalledWith(3, 10, undefined, undefined, undefined);
  });

  it('should handle limit change and reset page', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setPage(5);
      result.current.setGoToPageInput('5');
    });

    await act(async () => {
      result.current.handleLimitChange(20);
    });

    expect(result.current.limit).toBe(20);
    expect(result.current.page).toBe(1);
    expect(result.current.goToPageInput).toBe('');
    expect(mockFetchLogs).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
  });

  it('should handle go to page with valid page number', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setGoToPageInput('5');
    });

    const resultValue = await act(async () => {
      return result.current.handleGoToPage();
    });

    expect(resultValue).toEqual({ success: true });
    expect(result.current.page).toBe(5);
    expect(result.current.goToPageInput).toBe('');
    expect(mockFetchLogs).toHaveBeenCalledWith(5, 10, undefined, undefined, undefined);
  });

  it('should return error for invalid page number', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setGoToPageInput('0');
    });

    const resultValue = result.current.handleGoToPage();

    expect(resultValue).toEqual({
      success: false,
      message: 'Por favor, digite um número de página válido (maior que 0)',
    });
  });

  it('should return error for page number greater than total pages', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setGoToPageInput('15');
    });

    const resultValue = result.current.handleGoToPage();

    expect(resultValue).toEqual({
      success: false,
      message: 'A página 15 não existe. Total de páginas: 10',
    });
  });

  it('should return null when pagination is not available', () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: null,
      })
    );

    act(() => {
      result.current.setGoToPageInput('5');
    });

    const resultValue = result.current.handleGoToPage();

    expect(resultValue).toBeNull();
  });

  it('should preserve filters when changing page', async () => {
    const { result } = renderHook(() =>
      useWeatherFilters({
        fetchLogs: mockFetchLogs,
        pagination: mockPagination,
      })
    );

    act(() => {
      result.current.setCityFilter('Rio de Janeiro');
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });

    await act(async () => {
      result.current.handlePageChange(2);
    });

    expect(mockFetchLogs).toHaveBeenCalledWith(2, 10, 'Rio de Janeiro', '2025-01-01', '2025-01-31');
  });
});

