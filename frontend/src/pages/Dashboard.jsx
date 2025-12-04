import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../components/theme-provider";
import StatCard from "../components/dashboard/StatCard";
import WeatherChart from "../components/dashboard/WeatherChart";

const conditionMap = {
  0: "☀️ Céu limpo — tempo estável e sem nuvens.",
  1: "🌤️ Principalmente limpo — poucas nuvens.",
  2: "⛅ Parcialmente nublado — sol entre nuvens.",
  3: "☁️ Nublado — céu totalmente encoberto.",
  45: "🌫️ Neblina — visibilidade reduzida.",
  48: "🌫️ Neblina com gelo — piso escorregadio.",
  51: "🌦️ Chuvisco leve — garoa fraca.",
  53: "🌧️ Chuvisco moderado.",
  55: "🌧️ Chuvisco forte.",
  61: "🌦️ Chuva leve.",
  63: "🌧️ Chuva moderada.",
  65: "🌧️ Chuva forte.",
  71: "❄️ Neve leve.",
  73: "❄️ Neve moderada.",
  75: "❄️ Neve forte.",
  80: "🌧️ Pancada de chuva leve.",
  81: "🌧️🌧️ Pancada de chuva moderada.",
  82: "🌧️🌧️🌧️ Pancada de chuva forte.",
  95: "⛈️ Tempestade — trovões e relâmpagos. Cuidado!",
  96: "⛈️🌧️ Tempestade com granizo leve.",
  99: "⛈️🧊 Tempestade com granizo forte.",
};

export default function Dashboard() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/weather/logs");
      setLogs(await res.json());
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/weather/insights");
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      console.error("Erro insights:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchLogs(), fetchInsights()]);
      setLoading(false);
    })();
  }, []);

  const chartData = logs.length
    ? Object.values(
      logs
        .filter(log => log.temperature !== undefined)
        .reduce((acc, log) => {
          const date = new Date(log.datetime);
          const hour = date.getHours();
          if (!acc[hour]) acc[hour] = { hour: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), temps: [] };
          acc[hour].temps.push(log.temperature);
          return acc;
        }, {})
    ).map(item => ({
      hour: item.hour,
      temp: (item.temps.reduce((a, b) => a + b, 0) / item.temps.length).toFixed(1),
    }))
    : [];

  const latestLog = logs[0] || {};

  return (
    <div className="min-h-screen p-6 from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"
            }`}
        >
          {latestLog.city ? `☁️ Clima em ${latestLog.city}` : "Dashboard do Clima"}
        </motion.h1>

        {/* Cards*/}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { title: "Temperatura Atual", value: latestLog.temperature ? `${latestLog.temperature}°C` : "–", icon: "🌡️" },
            { title: "Umidade", value: latestLog.humidity ? `${latestLog.humidity}%` : "–", icon: "💧" },
            { title: "Vento", value: latestLog.wind_speed ? `${latestLog.wind_speed} km/h` : "–", icon: "💨" },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300
        ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white/90 border-gray-200 text-gray-900"}
      `}
            >
              <div className="flex items-center gap-3 mb-4 text-2xl">{card.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </motion.div>
        {/*Condição Atual*/}
        {latestLog.condition_code !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-blue-200"
          >
            <h2 className="text-xl font-semibold mb-1 text-gray-800">Condição Atual</h2>
            <p className="text-lg text-gray-700">
              {conditionMap[latestLog.condition_code]}
            </p>
          </motion.div>
        )}

        {/*Insights*/}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-xl border border-blue-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">☀️ Previsão do tempo</h2>

            <p className="text-gray-700 text-lg mb-4">{insights.summary}</p>

            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {insights.insights.map((item, idx) => (
                <li key={idx} className="text-md">{item}</li>
              ))}
            </ul>

            <div className="mt-4 p-4 bg-white rounded-xl border shadow">
              <p className="text-gray-800 font-medium">{insights.forecast}</p>
            </div>
          </motion.div>
        )}

        {/*Grafico*/}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-xl"
        >
          {loading ? (
            <p className="text-center text-gray-500">Carregando gráfico...</p>
          ) : (
            <WeatherChart data={chartData} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
3