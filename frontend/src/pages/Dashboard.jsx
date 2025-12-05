import { useEffect, useState } from "react";
import api from "@/lib/api";
import { weatherIcon } from "@/lib/weather";
import ChartTemperature from "@/components/ChartTemperature";
import LogsTable from "@/components/LogsTable";

export default function Dashboard({ city, coords, weather }) {
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // BUSCA PREVISÃO HORÁRIA (Open-Meteo)
    const fetchExternal = async () => {
      try {
        const lat = coords?.lat ?? -23.55;
        const lon = coords?.lon ?? -46.63;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m&timezone=auto`;

        const r = await fetch(url);
        const d = await r.json();

        if (d.hourly?.time) {
          const chart = d.hourly.time.map((t, i) => ({
            time: t.split("T")[1] ?? t,
            temp: d.hourly.temperature_2m[i],
          }));
          setChartData(chart.slice(0, 24)); // 24 horas
        }
      } catch (err) {
        console.error("Erro open-meteo", err);
      }
    };

    // BUSCA LOGS DO BACKEND
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/weather/logs");
        const arr = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setLogs(arr);
      } catch (err) {
        console.error("erro logs", err);
      }
    };

    fetchExternal();
    fetchLogs();
  }, [coords]);

  return (
    <div className="space-y-8">

      {/* CARD DE CLIMA – (seu card original, mantido EXACTAMENTE igual) */}
      <div className="bg-gray-800 bg-opacity-60 border border-gray-700 rounded-xl p-6 shadow-lg max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🌍 Clima Atual — {city ?? "Detectando..."}
        </h2>

        {!weather ? (
          <p className="text-gray-400">Carregando clima...</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 text-lg">

            {/* Temperatura atual */}
            <div className="flex flex-col">
              <span className="text-gray-400">Agora</span>
              <span className="text-3xl font-bold">
                {weatherIcon(weather.code)} {weather.temp}°C
              </span>
            </div>

            {/* Vento */}
            <div className="flex flex-col">
              <span className="text-gray-400">Vento</span>
              <span className="text-2xl">{weather.wind} km/h 💨</span>
            </div>

            {/* Máxima */}
            <div className="flex flex-col">
              <span className="text-gray-400">Máxima do dia</span>
              <span className="text-xl text-red-300">{weather.temp_max}°C 🔥</span>
            </div>

            {/* Mínima */}
            <div className="flex flex-col">
              <span className="text-gray-400">Mínima do dia</span>
              <span className="text-xl text-blue-300">{weather.temp_min}°C ❄️</span>
            </div>
          </div>
        )}
      </div>

      {/* GRAFICO + HISTÓRICO RÁPIDO (do novo layout) */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* GRÁFICO – mantém exatamente como você pediu */}
        <div className="md:col-span-2">
          <ChartTemperature data={chartData} />
        </div>

        {/* SUMMARY + TABELA */}
        <div className="space-y-4">

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Últimos registros</h3>
            {logs.length === 0 ? (
              <p className="text-gray-400">Nenhum registro recebido ainda</p>
            ) : (
              <div className="text-sm space-y-2 max-h-48 overflow-auto">
                {logs.slice(0, 8).map((l) => (
                  <div key={l._id} className="flex justify-between">
                    <div>{new Date(l.timestamp).toLocaleTimeString()}</div>
                    <div>{l.location}</div>
                    <div className="font-semibold">{l.temperature}°C</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORICO RÁPIDO (mini tabela) */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Histórico rápido</h4>
            <LogsTable logs={logs.slice(0, 50)} />
          </div>
        </div>
      </div>
    </div>
  );
}
