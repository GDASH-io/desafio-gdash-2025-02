import React from "react";
import WeatherCard from "../components/WeatherCard";
import InsightsCard from "../components/InsightsCard";
import { TemperatureChart } from "../components/TemperatureChart";
import { RainProbabilityChart } from "../components/RainProbabilityChart";
import { WeatherTable } from "../components/WeatherTable";
import { ExportButtons } from "../components/ExportButtons";
import { WiDaySunny, WiCloud, WiStrongWind, WiRaindrop } from "react-icons/wi";
import { Link } from "react-router-dom";


interface WeatherData {
  _id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windspeed: number;
  condition?: string;
  rain_probability?: number;
}

interface DashboardProps {
  weatherData: WeatherData[];
  insight: string;
  forecast: string;
  summary: string;
  alerts: string;
  onLogout: () => void;
}

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="transform hover:scale-[1.02] transition-all duration-300">{children}</div>
);

export default function Dashboard({
  weatherData,
  insight,
  forecast,
  summary,
  alerts,
  onLogout,
}: DashboardProps) {

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="p-8 text-gray-500 text-center text-lg animate-pulse">
        Nenhum dado disponível no momento...
      </div>
    );
  }

  const insightsMap: Record<string, string> = { insight, summary, forecast, alerts };

  const insightCards = [
    { title: "Insight Geral", icon: <WiDaySunny size={40} color="#F59E0B" />, key: "insight" },
    { title: "Resumo Diário", icon: <WiCloud size={40} color="#3B82F6" />, key: "summary" },
    { title: "Previsão Curto Prazo", icon: <WiRaindrop size={40} color="#0EA5E9" />, key: "forecast" },
    { title: "Alertas Inteligentes", icon: <WiStrongWind size={40} color="#EF4444" />, key: "alerts" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-gradient-to-br from-blue-50 to-yellow-50 min-h-screen font-inter">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow-md">
          ☀️ Dashboard 
        </h1>

      <button className="bg-amber-500 px-4 py-2 rounded">
         <Link to="/users">Gerenciar Usuários</Link>
       </button>

        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 transition-all text-white px-4 sm:px-5 py-2 rounded-xl shadow-md hover:shadow-lg"
        >
          Sair
        </button>


      </header>

      {/* WEATHER CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {weatherData.slice(0, 3).map((item) => (
          <div
            key={item._id}
            className="bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-200 p-4 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300"
          >
            <WeatherCard data={item} />
          </div>
        ))}
      </section>

      {/* GRÁFICOS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-6 shadow-lg border border-yellow-100 hover:shadow-2xl transition">
          <TemperatureChart data={weatherData} />
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-6 shadow-lg border border-blue-100 hover:shadow-2xl transition">
          <RainProbabilityChart data={weatherData} />
        </div>
      </section>

      {/* TABELA */}
      <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-6 border border-gray-100 hover:shadow-2xl transition overflow-x-auto">
        <WeatherTable rows={weatherData} />
      </section>

      {/* EXPORT */}
      <section className="flex justify-end">
        <ExportButtons />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {insightCards.map((card) => (
          <SectionCard key={card.key}>
            <div className="flex items-start gap-4 bg-gradient-to-r from-white/80 via-yellow-50 to-white/70 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="flex-shrink-0">{card.icon}</div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-1 sm:mb-2">{card.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base md:text-base whitespace-pre-line">{insightsMap[card.key]}</p>
              </div>
            </div>
          </SectionCard>
        ))}
      </section>
    </div>
  );
}
