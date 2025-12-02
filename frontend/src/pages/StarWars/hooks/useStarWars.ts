import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { starWarsService } from "@/services/starWarsService";
import type { Starship } from "@/types/starWarsType";

export function useStarWars() {
  // Estados de Dados
  const [starships, setStarships] = useState<Starship[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStarship, setSelectedStarship] = useState<Starship | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Função de busca (Memoized)
  const fetchStarships = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const data = await starWarsService.getStarships(currentPage);
      setStarships(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar naves.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregar ao mudar a página
  useEffect(() => {
    fetchStarships(page);
  }, [page, fetchStarships]);

  // Lógica do Modal
  const getStarshipId = (url: string) => {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  const handleViewDetails = async (starshipUrl: string) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    setSelectedStarship(null);

    try {
      const id = getStarshipId(starshipUrl);
      const details = await starWarsService.getStarshipById(id);
      setSelectedStarship(details);
    } catch (error) {
      toast.error("Erro ao carregar detalhes.");
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Funções de Paginação
  const nextPage = () => {
    const totalPages = Math.ceil(totalCount / 10);
    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1));
  };

  const prevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  return {
    data: {
      starships,
      totalCount,
      totalPages: Math.ceil(totalCount / 10) || 1,
      selectedStarship,
    },
    ui: {
      loading,
      page,
      isModalOpen,
      loadingDetails,
    },
    actions: {
      setIsModalOpen,
      viewDetails: handleViewDetails,
      nextPage,
      prevPage,
    },
  };
}
