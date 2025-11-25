import { useQuery } from "@tanstack/react-query";
import { weatherAPI } from "../api";
import { Cloud, Droplets, Wind, Download, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdvancedInsightsPanel from "../components/AdvancedInsightsPanel";
import "./Dashboard.css";

export default function Dashboard() {
  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: () => weatherAPI.getAll(50),
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  const { data: statistics } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => weatherAPI.getStatistics(),
  });

  const { data: insights } = useQuery({
    queryKey: ["insights"],
    queryFn: () => weatherAPI.getInsights(),
  });

  const handleExport = async (type: "csv" | "xlsx") => {
    try {
      const response =
        type === "csv"
          ? await weatherAPI.exportCSV()
          : await weatherAPI.exportExcel();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weather-data.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

  const chartData = weatherData?.data
    .slice(0, 20)
    .reverse()
    .map((item: any) => ({
      city: item.city,
      temp: item.temperature,
      humidity: item.humidity,
    }));

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard de Clima</h1>
        <div className="export-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => handleExport("csv")}
          >
            <Download size={16} /> CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport("xlsx")}
          >
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">
            <Cloud size={28} color="white" strokeWidth={2.5} />
          </div>
          <div className="stat-info">
            <h3>Total de Registros</h3>
            <p className="stat-value">{statistics?.data.total || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-icon">
            <Cloud size={28} color="white" strokeWidth={2.5} />
          </div>
          <div className="stat-info">
            <h3>Temperatura Média</h3>
            <p className="stat-value">{statistics?.data.avgTemp || 0}°C</p>
          </div>
        </div>

        <div className="stat-card stat-card-cyan">
          <div className="stat-icon">
            <Droplets size={28} color="white" strokeWidth={2.5} />
          </div>
          <div className="stat-info">
            <h3>Umidade Média</h3>
            <p className="stat-value">{statistics?.data.avgHumidity || 0}%</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-icon">
            <Wind size={28} color="white" strokeWidth={2.5} />
          </div>
          <div className="stat-info">
            <h3>Cidades</h3>
            <p className="stat-value">{statistics?.data.cities?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h2>Temperatura por Cidade</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#667eea"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      {insights?.data && (
        <div className="card insights-card">
          <div className="insights-header">
            <div className="flex items-center gap-3">
              <div className="insight-icon-wrapper">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2>Insights Rápidos</h2>
                {insights.data.usedAI && (
                  <span className="ai-badge">{insights.data.model}</span>
                )}
              </div>
            </div>
          </div>
          <div className="insights-content">
            <div className="insight-box">
              <pre className="whitespace-pre-wrap">
                {insights.data.insights}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Insights with Vector Store */}
      <AdvancedInsightsPanel />

      {/* Recent Data Table */}
      <div className="card">
        <h2>Dados Recentes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Cidade</th>
                <th>Temperatura</th>
                <th>Sensação</th>
                <th>Umidade</th>
                <th>Descrição</th>
                <th>Vento</th>
              </tr>
            </thead>
            <tbody>
              {weatherData?.data.slice(0, 10).map((item: any) => (
                <tr key={item._id}>
                  <td>{item.city}</td>
                  <td>{item.temperature}°C</td>
                  <td>{item.feels_like}°C</td>
                  <td>{item.humidity}%</td>
                  <td>{item.description}</td>
                  <td>{item.wind_speed} m/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
