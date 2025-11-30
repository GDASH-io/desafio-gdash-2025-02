import { useQuery } from "@/app/hooks/useQuery";
import { ExplorerService } from "@/app/service/explorer";
import { useCallback, useState } from "react";

export function useExplorerController() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const fetcher = useCallback((signal?: AbortSignal) => {
    return ExplorerService.findAll(currentPage, signal);
  }, [currentPage]);

  const { data, isLoading } = useQuery({ fetcher });

  return {
    data,
    isLoading,
    currentPage,
    handlePreviousPage,
    handleNextPage,  
  }
}