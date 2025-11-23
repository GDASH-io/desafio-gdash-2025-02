import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Rocket,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getSpacexLaunches, type SpacexLaunch } from "../services/api";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

export function SpacexDashboard() {
  const [launches, setLaunches] = useState<SpacexLaunch[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await getSpacexLaunches(pageNumber, 9);
      setLaunches(response.data);
      setTotalPages(response.meta.totalPages);
      setPage(response.meta.page);
    } catch (error) {
      console.error("Erro ao buscar lançamentos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dashboard-bg text-dashboard-text font-sans selection:bg-dashboard-highlight selection:text-white">
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      <main className="flex-1 p-4 md:p-8 pb-20 space-y-6 md:space-y-8 overflow-y-auto w-full">
        {/* Header Reutilizado (Mas poderíamos customizar o título se passássemos props) */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Lançamentos SpaceX
            </h1>
            <p className="text-sm text-dashboard-muted">
              Histórico de missões espaciais
            </p>
          </div>
          {/* Placeholder para manter alinhamento com o Header original se necessário, ou importe o DashboardHeader se ele for genérico o suficiente */}
          <DashboardHeader />
        </div>

        {/* GRID DE LANÇAMENTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? // SKELETONS
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-dashboard-card rounded-3xl animate-pulse border border-white/5"
                />
              ))
            : launches.map((launch) => (
                <Card
                  key={launch.id}
                  className="bg-dashboard-card border-white/5 hover:border-dashboard-highlight/50 transition-all duration-300 group"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="bg-dashboard-bg p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <Rocket className="h-6 w-6 text-dashboard-highlight" />
                    </div>
                    {launch.success ? (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Sucesso
                      </span>
                    ) : launch.success === false ? (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-red-500/30">
                        <XCircle className="h-3 w-3" /> Falha
                      </span>
                    ) : (
                      <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full border border-gray-500/30">
                        Pendente
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <CardTitle
                        className="text-white text-lg truncate"
                        title={launch.name}
                      >
                        {launch.name}
                      </CardTitle>
                      <p className="text-sm text-dashboard-muted flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />{" "}
                        {new Date(launch.date_utc).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-sm text-gray-300 bg-dashboard-bg/50 p-3 rounded-xl min-h-[60px]">
                      <span className="text-dashboard-highlight font-bold text-xs block mb-1">
                        FOGUETE
                      </span>
                      {launch.rocket?.name || "Desconhecido"}
                    </div>

                    {launch.details && (
                      <p
                        className="text-xs text-gray-500 line-clamp-2"
                        title={launch.details}
                      >
                        {launch.details}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* PAGINAÇÃO */}
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="bg-transparent border-white/10 text-white hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>
          <span className="text-sm text-dashboard-muted">
            Página <span className="text-white font-bold">{page}</span> de{" "}
            {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="bg-transparent border-white/10 text-white hover:bg-white/5"
          >
            Próximo <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
