import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Cloud,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetWeatherQuery } from "@/modules/weather/api";
import { useLogout } from "@/modules/auth/hooks";
import { useNavigate } from "react-router-dom";
import { WeatherTable } from "./WeatherTable";
import { WeatherStats } from "./WeatherStats";

export function WeatherPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useGetWeatherQuery({
    page,
    itemsPerPage,
  });

  const { handleLogout } = useLogout();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--primary)/0.05,var(--background),var(--secondary)/0.05)] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative bg-[linear-gradient(to_bottom_right,#3B82F6,#2563EB)] p-3 rounded-2xl shadow-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold bg-[linear-gradient(to_right,var(--primary),var(--secondary))] bg-clip-text text-transparent">
                GDash
              </h1>
              <p className="text-sm text-muted-foreground">
                Dashboard de Dados Climáticos
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogoutClick}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {data && data.data.length > 0 && <WeatherStats data={data.data} />}

        <Card className="shadow-2xl border-2 mt-8">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Dados Climáticos
                </CardTitle>
                <CardDescription className="mt-2">
                  Visualização dos dados coletados em tempo real
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-destructive font-semibold text-lg mb-2">
                  Erro ao carregar dados
                </p>
                <p className="text-muted-foreground">
                  Tente novamente mais tarde
                </p>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Cloud className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">
                  Nenhum dado disponível
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os dados aparecerão aqui quando estiverem disponíveis
                </p>
              </div>
            ) : (
              <>
                <WeatherTable data={data.data} />

                {data.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      Página {data.page} de {data.totalPages} •{" "}
                      {data.totalItems} registros no total
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
