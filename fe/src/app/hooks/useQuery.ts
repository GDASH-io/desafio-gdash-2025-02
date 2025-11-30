import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

export type ErrorType = {
  message?: string;
  code?: number;
};

type QueryResult<T> = {
  data: T | null;
  error: ErrorType | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isError: boolean;
};

type UseQueryParams<T> = {
  fetcher: (signal?: AbortSignal) => Promise<T>;
  enabled?: boolean;
};

export function useQuery<T>({
  fetcher,
  enabled = true,
}: UseQueryParams<T>): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ErrorType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFunction = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher(signal);
      if(!result) {
        setData(null);
        setIsLoading(false);
        return;
      }
      setData(result);
      setError(null);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setError({
          message: error.response.data?.message || "An error occurred",
          code: error.response.status,
        });
      } else {
        setError({
          code: 500,
          message: "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  const executeFetch = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    await fetchFunction(signal);
  }, [fetchFunction, enabled]);

  useEffect(() => {
    const controller = new AbortController();
    executeFetch(controller.signal);

    return () => controller.abort();
  }, [executeFetch]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchFunction,
    isError: error !== null,
  };
}
