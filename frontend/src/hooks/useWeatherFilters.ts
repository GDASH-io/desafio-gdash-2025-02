import { useState, useCallback } from 'react';

/**
 * Parâmetros para o hook useWeatherFilters
 */
interface UseWeatherFiltersParams {
  fetchLogs: (
    page: number,
    limit: number,
    city?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  pagination: any;
}

/**
 * Hook para gerenciar filtros e paginação de logs climáticos
 */
export function useWeatherFilters({ fetchLogs, pagination }: UseWeatherFiltersParams) {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [goToPageInput, setGoToPageInput] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const applyFilters = useCallback(() => {
    setPage(1);
    fetchLogs(1, limit, cityFilter || undefined, startDate || undefined, endDate || undefined);
  }, [fetchLogs, limit, cityFilter, startDate, endDate]);

  const clearFilters = useCallback(() => {
    setCityFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs(1, limit);
  }, [fetchLogs, limit]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchLogs(
        newPage,
        limit,
        cityFilter || undefined,
        startDate || undefined,
        endDate || undefined
      );
    },
    [fetchLogs, limit, cityFilter, startDate, endDate]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1);
      setGoToPageInput('');
      fetchLogs(
        1,
        newLimit,
        cityFilter || undefined,
        startDate || undefined,
        endDate || undefined
      );
    },
    [fetchLogs, cityFilter, startDate, endDate]
  );

  const handleGoToPage = useCallback(() => {
    if (!pagination) return null;

    const pageNumber = parseInt(goToPageInput, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return { success: false, message: 'Por favor, digite um número de página válido (maior que 0)' };
    }

    if (pageNumber > pagination.totalPages) {
      return {
        success: false,
        message: `A página ${pageNumber} não existe. Total de páginas: ${pagination.totalPages}`,
      };
    }

    setPage(pageNumber);
    setGoToPageInput('');
    fetchLogs(
      pageNumber,
      limit,
      cityFilter || undefined,
      startDate || undefined,
      endDate || undefined
    );

    return { success: true };
  }, [pagination, goToPageInput, fetchLogs, limit, cityFilter, startDate, endDate]);

  return {
    page,
    limit,
    goToPageInput,
    cityFilter,
    startDate,
    endDate,
    setPage,
    setLimit,
    setGoToPageInput,
    setCityFilter,
    setStartDate,
    setEndDate,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleLimitChange,
    handleGoToPage,
  };
}

