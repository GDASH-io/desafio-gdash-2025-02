import React, { useState, useEffect } from "react";
import { ForecastCard } from "../components/ForecastCard.tsx";
import { ForecastChart } from "../components/ForecastChart";
import { Download } from "lucide-react";
import { downloadWeatherCsv } from "../../../services/export/export-csv.js";
import { downloadWeatherXlsx } from "../../../services/export/export-xlsx.js";
import { getCurrentWeek } from "../../../services/weather-router/view-days.ts";

export function ForecastPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getCurrentWeek();
      setLogs(data || []);
    }
    load();
  }, []);

  const downloadLog = (id: string) => {
    downloadWeatherCsv(id);
    downloadWeatherXlsx(id);  
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 text-white pt-16 md:pt-0">
      <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-7xl mx-auto">
        <button
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/20 px-6 py-3 rounded-full font-semibold text-lg text-white mb-6 backdrop-blur-sm hover:scale-105 flex items-center gap-2"
        >
          Ver Todos os Dados
        </button>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
            <div className="relative bg-gradient-to-br from-blue-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl p-6 overflow-y-auto max-h-[85vh] border border-white/20">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full shadow-md text-white font-semibold transition"
              >
                X
              </button>

              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-400 drop-shadow-lg">Todos os Dados</h2>

              <div className="flex flex-col gap-5">
                {logs.map((log, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-900 flex items-center justify-center font-bold text-white shadow-md text-lg animate-pulse">
                      IA
                    </div>
                    <div className="flex-1 bg-white/10 p-4 rounded-3xl shadow-lg hover:bg-white/20 transition relative border-l-4 border-blue-700">
                      <p className="font-semibold text-white"><strong>Dia:</strong> {new Date(log.time).toLocaleDateString("pt-BR")}</p>
                      <p className="text-white/80"><strong>Hora:</strong> {new Date(log.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-white/80"><strong>Temperatura:</strong> {log.temperature}°C</p>
                      <p className="text-white/80"><strong>Umidade:</strong> {log.humidity}%</p>
                      <p className="text-white/80"><strong>Vento:</strong> {log.wind_speed} km/h</p>
                      <p className="text-white/80"><strong>Condição:</strong> {log.sky_condition}</p>
                      <button
                        onClick={() => downloadLog(log._id)}
                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-2 rounded-full shadow-md flex items-center justify-center transition"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {logs.map((day, i) => (
            <ForecastCard key={i} day={day} />
          ))}
        </div>
        <div className="hidden md:block w-full mt-10">
          <ForecastChart logs={logs} />
        </div>
      </div>
    </div>
  );
}
