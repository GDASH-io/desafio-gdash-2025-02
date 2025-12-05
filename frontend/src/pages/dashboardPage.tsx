import React from "react";
import { Loader2, Wind, Droplet, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import WeatherLogTable from "../components/weatherLogTable";
import Navbar from "../components/navBar";
import { useWeather } from "../hooks/useWeather";
import { useExport } from "../hooks/useExport";
import { Button } from "../components/ui/button";
import PaginationControls from "../components/paginationControls";
import ExportModal from "../components/exportModal";
import TemperatureChart from "../components/temperatureChart";

const DashboardPage: React.FC = () => {
  const {
    logs,
    insights,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    changePage,
    dailyTemps,
  } = useWeather();
  const { handleExport, isExporting } = useExport();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const latestLog = logs.length > 0 ? logs[0] : null;

  return (
    <div className="min-h-screen bg-[#f8fbfe]">
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Dashboard Climático{" "}
          <span className="animate-earth-spin text-3xl ml-2">🌎</span>
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <p>{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Temperatura Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestLog ? `${latestLog.temperature_c.toFixed(1)} °C` : "--"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condição</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground animate-drop-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestLog ? latestLog.condition : "--"}
              </div>
            </CardContent>
          </Card>
          <Card className={insights?.alert ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Insights (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 font-semibold mb-1">
                {insights?.classification || "--"}
              </p>
              <div className="text-xs text-muted-foreground h-10 overflow-hidden">
                {insights?.alert ||
                  insights?.summary_text ||
                  "Carregando análise..."}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground animate-wind-sopro" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestLog
                  ? `${latestLog.wind_speed_kmh.toFixed(1)} km/h`
                  : "--"}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="sm:flex justify-between">
          <h2 className="text-2xl font-semibold mb-4">Logs Recentes</h2>
          <Button
            variant="gdash"
            onClick={() => setIsModalOpen(true)}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Exportar Dados
              </>
            )}
          </Button>
        </div>
        {!isLoading && dailyTemps.length > 0 && (
          <div className="mb-8 mt-4">
            <TemperatureChart data={dailyTemps} />
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            <WeatherLogTable logs={logs} />
            {totalPages > 1 && (
              <PaginationControls
                changePage={changePage}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
                nameItem="Logs"
              />
            )}
          </>
        )}
      </main>
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default DashboardPage;
