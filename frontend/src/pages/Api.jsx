import { useTheme } from "@/components/theme-provider";
import { FileText, CloudRain, Zap } from "lucide-react";

export default function Api() {
  const { theme } = useTheme();

  const endpoints = [
    {
      name: "Weather Logs",
      description: "Lista todos os registros climáticos coletados.",
      method: "GET",
      url: "http://localhost:3000/api/weather/logs",
      icon: <CloudRain size={20} />,
      action: () => window.open("http://localhost:3000/api/weather/logs", "_blank"),
    },
    {
      name: "Export CSV",
      description: "Exporta os registros climáticos em CSV.",
      method: "GET",
      url: "http://localhost:3000/api/weather/logs/export.csv",
      icon: <FileText size={20} />,
      action: () => window.open("http://localhost:3000/api/weather/logs/export.csv", "_blank"),
    },
    {
      name: "Export XLSX",
      description: "Exporta os registros climáticos em XLSX.",
      method: "GET",
      url: "http://localhost:3000/api/weather/logs/export.xlsx",
      icon: <FileText size={20} />,
      action: () => window.open("http://localhost:3000/api/weather/logs/export.xlsx", "_blank"),
    },
    {
      name: "Weather Insights",
      description: "Gera insights de IA sobre os dados climáticos.",
      method: "GET / POST",
      url: "http://localhost:3000/api/weather/insights",
      icon: <Zap size={20} />,
      action: () => window.open("http://localhost:3000/api/weather/insights", "_blank"),
    },
  ];

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white/90";
  const titleColor = theme === "dark" ? "text-white" : "text-gray-900";
  const descColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const methodColor = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className={`text-4xl font-extrabold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          🌐 API - Endpoints
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300 ${cardBg}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {ep.icon}
                <h2 className={`text-xl font-semibold ${titleColor}`}>{ep.name}</h2>
              </div>
              <p className={`${descColor} mb-4`}>{ep.description}</p>
              <p className={`font-mono mb-4 ${methodColor}`}>{ep.method}</p>
              <button
                onClick={ep.action}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Abrir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
