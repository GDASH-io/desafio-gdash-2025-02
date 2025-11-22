import { Button } from "@/components/ui/button";
import {
  Droplets,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wind,
} from "lucide-react";
import type { WeatherInsight, WeatherLog } from "../../services/api";

interface Props {
  current: WeatherLog | undefined;
  insight: WeatherInsight | null;
}

export function HighlightsGrid({ current, insight }: Props) {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      <div className="bg-dashboard-card rounded-[2rem] p-6 border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" /> Análise IA
        </h3>

        <div className="text-sm text-gray-300 leading-relaxed italic min-h-[40px]">
          {insight ? (
            `"${insight.summary}"`
          ) : (
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
            </div>
          )}
        </div>

        {insight?.alert && (
          <div className="mt-4 bg-red-500/20 p-3 rounded-xl border border-red-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
            <span className="text-xs font-bold text-red-200">
              {insight.alert}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label="VENTO"
          value={current?.wind_speed}
          unit="km/h"
          icon={Wind}
          loading={!current}
        />
        <MetricCard
          label="UMIDADE"
          value={current?.humidity}
          unit="%"
          icon={Droplets}
          loading={!current}
        />

        <div className="bg-dashboard-card rounded-3xl p-5 border border-white/5 col-span-1 sm:col-span-2">
          <div className="text-white text-xs font-medium mb-2">
            MÉDIA TÉRMICA (IA)
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-white">
              {insight ? (
                `${insight.averageTemp}°`
              ) : (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
              )}
            </span>

            {insight ? (
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  insight.trend === "up"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                    : insight.trend === "down"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                }`}
              >
                {insight.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {insight.trend === "down" && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {insight.trend === "stable" && <Minus className="h-3 w-3" />}
                {insight.trend === "up"
                  ? "Subindo"
                  : insight.trend === "down"
                  ? "Caindo"
                  : "Estável"}
              </div>
            ) : (
              <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <Button
          onClick={() =>
            window.open("http://localhost:3000/api/weather/export/csv")
          }
          variant="outline"
          className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl transition-all hover:scale-105"
        >
          CSV
        </Button>
        <Button
          onClick={() =>
            window.open("http://localhost:3000/api/weather/export/xlsx")
          }
          className="bg-dashboard-highlight hover:bg-dashboard-highlight/80 text-dashboard-card font-bold rounded-xl shadow-lg shadow-dashboard-highlight/20 transition-all hover:scale-105"
        >
          Excel
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, icon: Icon, loading }: any) {
  return (
    <div className="bg-dashboard-card rounded-3xl p-5 border border-white/5 transition-all hover:bg-white/5">
      <div className="text-white text-xs font-medium mb-2">{label}</div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">
          {loading ? (
            <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
          ) : (
            value
          )}
        </span>
        <span className="text-xs mb-1 text-white">{unit}</span>
      </div>
      <Icon className="h-5 w-5 text-dashboard-highlight mt-3" />
    </div>
  );
}
