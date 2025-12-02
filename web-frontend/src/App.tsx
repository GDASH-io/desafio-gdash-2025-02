import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import api from "./api";

interface WeatherData {
  _id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windspeed: number;
  condition?: string;
  rain_probability?: number;
}

interface ProtectedRouteProps {
  token: string | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ token, children }) => {
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const formatWeatherArray = (data: WeatherData[]): string => {
  return data
    .map(
      (item) =>
        `- ${new Date(item.timestamp).toLocaleTimeString()} | Temp: ${item.temperature}°C | Umidade: ${item.humidity}% | Vento: ${item.windspeed} m/s | Condição: ${item.condition || "N/A"}`
    )
    .join("\n");
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [forecast, setForecast] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [alerts, setAlerts] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [weatherRes, insightRes, forecastRes, summaryRes, alertsRes] =
        await Promise.all([
          api.get("/weather"),
          api.get("/ai/insights"),
          api.get("/ai/forecast"),
          api.get("/ai/summary"),
          api.get("/ai/alerts"),
        ]);

      setWeatherData(weatherRes.data);

      setInsight(
        Array.isArray(insightRes.data)
          ? formatWeatherArray(insightRes.data)
          : typeof insightRes.data === "string"
          ? insightRes.data
          : JSON.stringify(insightRes.data, null, 2)
      );

      const f = forecastRes.data;
      setForecast(
        typeof f === "string"
          ? f
          : `- Previsão: ${f.previsao}\n- Chance de chuva: ${f.chance_chuva}\n- Temperatura: ${f.temperatura_prevista}`
      );

      setSummary(
        typeof summaryRes.data === "string"
          ? summaryRes.data
          : JSON.stringify(summaryRes.data, null, 2)
      );

      const a = alertsRes.data.alertas;
      setAlerts(
        Array.isArray(a)
          ? a.map((alert) => `- ${alert}`).join("\n")
          : typeof a === "string"
          ? `- ${a}`
          : JSON.stringify(a, null, 2)
      );
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [token, fetchData]);

  const handleLogin = (t: string) => {
    setToken(t);
    localStorage.setItem("token", t);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setWeatherData([]);
    setInsight("");
    setForecast("");
    setSummary("");
    setAlerts("");
  };

  if (!token) return <Login onLogin={handleLogin} />;

  if (loading)
    return (
      <div className="p-8 text-lg font-medium text-center">
        Carregando dados...
      </div>
    );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <Dashboard
                weatherData={weatherData}
                insight={insight}
                forecast={forecast}
                summary={summary}
                alerts={alerts}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute token={token}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
