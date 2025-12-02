import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogsDataWeatherTable } from "./components/LogsDataWeatherTable";
import { TemperatureChart } from "./components/TemperatureChart";
import { HumidityChart } from "./components/HumidityChart";
import { WindChart } from "./components/WindChart";
import { AiInsightCard } from "./components/AiInsightCard";
import { useDashboard } from "./hooks/useDashBoard";
import { DashboardHeader } from "./components/DashboardHeader";

export default function Dashboard() {
  const { data, loading, pagination, actions } = useDashboard();

  const [chartType, setChartType] = useState<
    "temperature" | "humidity" | "wind"
  >("temperature");

  const isGlobalLoading = Object.values(loading).some(Boolean);

  const ChartLoading = ({ text }: { text: string }) => (
    <div className="h-full w-full bg-white rounded-xl border border-zinc-200 flex flex-col items-center justify-center gap-3 shadow-sm min-h-80">
      <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-sm text-zinc-500 font-medium animate-pulse">
        {text}
      </span>
    </div>
  );

  const getLoadingText = () => {
    switch (chartType) {
      case "temperature":
        return "Carregando temperatura...";
      case "humidity":
        return "Carregando umidade...";
      case "wind":
        return "Carregando dados de vento...";
      default:
        return "Carregando...";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/*  BARRA DE FERRAMENTAS   */}
      <DashboardHeader
        onRefresh={actions.refresh}
        onExport={actions.export}
        isGlobalLoading={isGlobalLoading}
      />
      {/*  CONTEÚDO PRINCIPAL  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Card IA (Esquerda) */}
        <div className="lg:col-span-1 flex flex-col gap-3 h-full">
          {/* Espaçador invisível mantido para alinhamento visual com os tabs */}
          <div className="hidden lg:block h-9" aria-hidden="true" />

          <div className="min-h-80 h-full">
            <AiInsightCard insight={data.insight} isLoading={loading.insight} />
          </div>
        </div>

        {/* Gráficos (Direita) */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-80">
          <div className="flex justify-end gap-2 overflow-x-auto pb-1 h-9 items-center no-scrollbar">
            <Button
              variant={chartType === "temperature" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("temperature")}
              className={`gap-2 h-8 rounded-full px-4 transition-all ${
                chartType === "temperature"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Thermometer className="h-4 w-4" /> Temperatura
            </Button>
            <Button
              variant={chartType === "humidity" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("humidity")}
              className={`gap-2 h-8 rounded-full px-4 transition-all ${
                chartType === "humidity"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Droplets className="h-4 w-4" /> Umidade
            </Button>
            <Button
              variant={chartType === "wind" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("wind")}
              className={`gap-2 h-8 rounded-full px-4 transition-all ${
                chartType === "wind"
                  ? "bg-slate-600 hover:bg-slate-700"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Wind className="h-4 w-4" /> Vento
            </Button>
          </div>

          <div className="flex-1">
            {loading.chart ? (
              <ChartLoading text={getLoadingText()} />
            ) : (
              <>
                {chartType === "temperature" && (
                  <TemperatureChart data={data.chartData} />
                )}
                {chartType === "humidity" && (
                  <HumidityChart data={data.chartData} />
                )}
                {chartType === "wind" && <WindChart data={data.chartData} />}
              </>
            )}
          </div>
        </div>
      </div>

      {/*  TABELA DE DADOS  */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-800">
            Registos Detalhados
          </h3>
        </div>

        <LogsDataWeatherTable logs={data.logs} isLoading={loading.table} />

        {/* Paginação */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
          <span className="text-sm text-zinc-500 font-medium">
            Página{" "}
            <span className="text-zinc-900 font-bold">
              {pagination.current}
            </span>{" "}
            de {pagination.total}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.prev}
              disabled={pagination.current === 1 || loading.table}
              className="select-none"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.next}
              disabled={
                pagination.current === pagination.total || loading.table
              }
              className="select-none"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
