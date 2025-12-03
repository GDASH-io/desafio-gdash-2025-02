import { useGetUser } from "@/hooks/useGetUser";
import { useGetWeather } from "@/hooks/useGetWeather";
import { useGetWeatherHistory } from "@/hooks/useGetWeatherHistory";
import { useAuthStore } from "@/store/auth";

import { Header } from "@/components/Header";

import { HeaderSkeleton } from "@/components/skeleton/HeaderSkeleton";
import { InsightsSkeleton } from "@/components/skeleton/InsightsSkeleton";
import { WeatherHistorySkeleton } from "@/components/skeleton/WeatherHistory";
import { WeatherStatsSkeleton } from "@/components/skeleton/WeatherStatsSkeleton";
import { useGetWeatherInsights } from "@/hooks/useGetWeatherInsights";
import { Navigate } from "react-router-dom";
import { RainProbabilityChart } from "./components/RainProbabilityChart";
import { TemperatureChart } from "./components/TemperatureChart";
import { WeatherInsightsCard } from "./components/WeatherInsightsCard";
import { WeatherStats } from "./components/WeatherStats";
import { WeatherTable } from "./components/WeatherTable";
import { WindChart } from "./components/WindChart";
export function Dashboard() {
  const { data: user, isFetching: userFetching, isError } = useGetUser();
  const { data: weather, isFetching: weatherFetching } = useGetWeather();
  const { data: weatherHistory } = useGetWeatherHistory();
  const { data: weatherInsights, isError: errorInsights } =
    useGetWeatherInsights();
  const { logout } = useAuthStore();
  if (userFetching) return <HeaderSkeleton />;
  if (isError) return <p>Erro ao buscar usuário. Faça login novamente.</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full h-full bg-background">
      <Header userName={user.name} onLogout={logout} email={user.email} />

      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Estação Meteorológica
          </h2>
          <p className="text-muted-foreground">
            Acompanhe os dados climáticos em tempo real da sua região
          </p>
        </div>

        {!weather || weatherFetching ? (
          <div className="mt-5">
            <WeatherStatsSkeleton />
          </div>
        ) : (
          <WeatherStats data={weather} />
        )}

        {errorInsights || !weatherInsights ? (
          <div className="mt-5">
            <InsightsSkeleton />
          </div>
        ) : (
          <div className="mt-8">
            <WeatherInsightsCard data={weatherInsights} />
          </div>
        )}
        {!weatherHistory ? (
          <div className="mt-5">
            <WeatherHistorySkeleton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 mt-5 gap-5">
              <TemperatureChart data={weatherHistory} />
              <RainProbabilityChart data={weatherHistory} />
              <WindChart data={weatherHistory} />
            </div>
            <div className="mt-5">
              <WeatherTable data={weatherHistory} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
