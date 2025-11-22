import { Button } from "@/components/ui/button";
import { MoreHorizontal, Sun, Thermometer } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { WeatherLog } from "../../services/api";

interface Props {
  current: WeatherLog | undefined;
  logs: WeatherLog[];
}

export function MainWeatherCard({ current, logs }: Props) {
  return (
    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
      <div className="bg-dashboard-card rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden border border-white/5 text-center md:text-left gap-6 md:gap-0 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#50E3C2]/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

        <div className="space-y-4 md:space-y-6 z-10">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <span className="bg-[#50E3C2]/20 text-[#50E3C2] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#50E3C2]/20">
              Rio de Janeiro
            </span>
            <span className="text-white text-xs">
              Hoje, {new Date().toLocaleDateString()}
            </span>
          </div>

          <div>
            {current ? (
              <h2 className="text-6xl md:text-7xl font-bold text-white">
                {current.temperature.toFixed(0)}°C
              </h2>
            ) : (
              <div className="h-20 w-48 bg-white/10 rounded-xl animate-pulse mb-2" />
            )}

            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-white">
              <span className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" /> Max:{" "}
                {current ? (current.temperature + 2).toFixed(0) : "--"}°
              </span>
              <span className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" /> Min:{" "}
                {current ? (current.temperature - 2).toFixed(0) : "--"}°
              </span>
            </div>
          </div>
        </div>

        <div className="text-center md:text-right z-10">
          <Sun className="h-20 w-20 md:h-24 md:w-24 text-yellow-400 animate-pulse mx-auto md:mx-0" />
          <p className="text-xl font-medium mt-4 text-white">Ensolarado</p>
          <p className="text-white text-sm">
            Sensação de {current ? current.temperature.toFixed(0) : "--"}°
          </p>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-dashboard-card rounded-[2rem] p-6 flex-1 border border-white/5 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Histórico Recente</h3>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl h-8 text-xs bg-dashboard-bg text-white hover:bg-white/10"
          >
            Ver mais <MoreHorizontal className="ml-2 h-3 w-3" />
          </Button>
        </div>
        <div className="h-[200px] w-full">
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...logs].reverse()}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#50E3C2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#50E3C2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#343946"
                  vertical={false}
                />
                <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#23304D",
                    border: "1px solid #50E3C2",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#50E3C2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-end gap-2 animate-pulse">
              <div className="w-full h-1/3 bg-white/5 rounded-t"></div>
              <div className="w-full h-2/3 bg-white/5 rounded-t"></div>
              <div className="w-full h-1/2 bg-white/5 rounded-t"></div>
              <div className="w-full h-3/4 bg-white/5 rounded-t"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
