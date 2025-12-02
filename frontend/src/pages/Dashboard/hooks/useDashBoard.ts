import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { weatherService } from "@/services/weatherService";
import { authService } from "@/services/authService"; // Ajuste o import conforme sua estrutura
import type { AiInsight, WeatherDataLog } from "@/types/weatherType";
import { useNavigate } from "react-router-dom";

const AUTO_REFRESH_INTERVAL =
  import.meta.env.VITE_AUTO_REFRESH_INTERVAL || 120000; // 2 minutos como padrão

export function useDashboard() {
  const navigate = useNavigate();

  // Estados de Dados
  const [logs, setLogs] = useState<WeatherDataLog[]>([]);
  const [chartData, setChartData] = useState<WeatherDataLog[]>([]);
  const [insight, setInsight] = useState<AiInsight | null>(null);

  // Estados de UI/Loading
  const [loading, setLoading] = useState({
    table: true,
    chart: true,
    insight: true,
  });

  // Paginação
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  // --- Actions de Busca (Memoized para evitar loops) ---

  const fetchTableLogs = useCallback(async (page: number) => {
    setLoading((prev) => ({ ...prev, table: true }));
    try {
      const response = await weatherService.getLogs(page, 10);

      // Tratamento flexível da resposta (Array puro ou Objeto Paginado)
      if (Array.isArray(response)) {
        setLogs(response);
        setPagination((prev) => ({ ...prev, page, totalPages: 1 })); // Assumindo 1 se vier array
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        const paginated = response as {
          data: WeatherDataLog[];
          last_page?: number;
        };
        setLogs(paginated.data);
        setPagination((prev) => ({
          ...prev,
          page,
          totalPages: paginated.last_page || 1,
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar tabela.");
    } finally {
      setLoading((prev) => ({ ...prev, table: false }));
    }
  }, []);

  const fetchChartLogs = useCallback(async () => {
    // Evita loading piscando se já tiver dados
    setLoading((prev) =>
      chartData.length === 0 ? { ...prev, chart: true } : prev
    );
    try {
      const response = await weatherService.getLogs(1, 50);
      const data = Array.isArray(response)
        ? response
        : (response as any).data || [];

      setChartData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, chart: false }));
    }
  }, [chartData.length]);

  const fetchInsight = useCallback(async () => {
    setLoading((prev) => ({ ...prev, insight: true }));
    try {
      const data = await weatherService.getInsights();
      setInsight(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, insight: false }));
    }
  }, []);

  // Função Mestra de Refresh
  const refreshAll = useCallback(async () => {
    toast.info("Atualizando dados...");
    await Promise.all([
      fetchTableLogs(pagination.page),
      fetchChartLogs(),
      fetchInsight(),
    ]);
    toast.success("Painel atualizado!");
  }, [fetchTableLogs, fetchChartLogs, fetchInsight, pagination.page]);

  // --- Effects ---

  // 1. Monitora troca de página
  useEffect(() => {
    fetchTableLogs(pagination.page);
  }, [pagination.page, fetchTableLogs]);

  // 2. Inicialização e Timer
  useEffect(() => {
    fetchChartLogs();
    fetchInsight();
  }, []);

  // 3. Timer Automático (Resetado se refreshAll mudar, mas não dispara fetch imediato)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshAll]);
  // --- Handlers de Ação do Usuário ---

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      toast.promise(weatherService.downloadReport(format), {
        loading: `Gerando ${format.toUpperCase()}...`,
        success: "Download iniciado!",
        error: "Erro ao baixar arquivo.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
    toast.info("Até logo!");
  };

  // Retorna tudo limpo para o componente usar
  return {
    data: { logs, chartData, insight },
    loading,
    pagination: {
      current: pagination.page,
      total: pagination.totalPages,
      next: () => handlePageChange(pagination.page + 1),
      prev: () => handlePageChange(pagination.page - 1),
      goTo: handlePageChange,
    },
    actions: {
      refresh: refreshAll,
      export: handleExport,
      logout: handleLogout,
    },
  };
}
