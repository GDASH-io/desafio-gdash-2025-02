import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import type { WeatherData } from "../types";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Dashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [latestData, setLatestData] = useState<WeatherData | null>(null);
  const [comfortScore, setComfortScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
    loadLatestData();
    loadComfortScore();
  }, []);

  const loadWeatherData = async () => {
    try {
      const response = await api.get("/weather?limit=100");
      setWeatherData(response.data.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatestData = async () => {
    try {
      const response = await api.get("/weather/latest");
      setLatestData(response.data);
    } catch (error) {
      console.error("Erro ao carregar último dado:", error);
    }
  };

  const loadComfortScore = async () => {
    try {
      const response = await api.get("/weather/score/comfort");
      setComfortScore(response.data);
    } catch (error) {
      console.error("Erro ao carregar último dado:", error);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get("/weather/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weather-data-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
    }
  };

  const exportXLSX = async () => {
    try {
      const response = await api.get("/weather/export/xlsx", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weather-data-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar XLSX:", error);
    }
  };

  const chartData = weatherData.map((item) => ({
    time: format(new Date(item.collection_time * 1000), "dd/MM HH:mm", {
      locale: ptBR,
    }),
    temperature: item.temperature,
    humidity: item.humidity,
    wind_speed: item.wind_speed,
  }));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados climáticos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard Climático
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Visão geral das condições atuais e histórico recente
            {latestData && (
              <span className="ml-2 text-xs text-gray-500">
                • {latestData.city} • {format(new Date(latestData.collection_time * 1000), "dd/MM HH:mm", { locale: ptBR })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={exportCSV}>
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={exportXLSX}>
            Exportar XLSX
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-4">
        {latestData?.temperature !== undefined && latestData.temperature >= 35 && (
          <Alert className="mb-3">
            <AlertTitle>Alerta de Calor</AlertTitle>
            <AlertDescription>
              Temperatura alta registrada: <strong>{latestData.temperature}°C</strong>. Beba água e evite exposição prolongada ao sol.
            </AlertDescription>
          </Alert>
        )}

        {latestData?.wind_speed !== undefined && latestData.wind_speed >= 15 && (
          <Alert className="mb-3">
            <AlertTitle>Alerta de Vento Forte</AlertTitle>
            <AlertDescription>
              Velocidade do vento: <strong>{latestData.wind_speed} m/s</strong>. Atenção a objetos soltos e condução.
            </AlertDescription>
          </Alert>
        )}

        {comfortScore !== null && comfortScore < 40 && (
          <Alert className="mb-3">
            <AlertTitle>Conforto Baixo</AlertTitle>
            <AlertDescription>
              Pontuação de conforto {comfortScore}/100 — condições desconfortáveis para atividades ao ar livre.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Cards de Dados Atuais */}
      {latestData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestData.temperature}°C
              </div>
              <p className="text-sm text-gray-500">
                Sensação: {latestData.feels_like}°C
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestData.humidity}%</div>
              <p className="text-sm text-gray-500">
                Pressão: {latestData.pressure} hPa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestData.wind_speed} m/s
              </div>
              <p className="text-sm text-gray-500">
                Direção: {latestData.wind_direction}°
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Condição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold capitalize">
                {latestData.weather_condition}
              </div>
              <p className="text-sm text-gray-500">{latestData.city}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#3b82f6"
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Umidade e Vento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="humidity" fill="#10b981" name="Umidade (%)" />
                <Bar dataKey="wind_speed" fill="#f59e0b" name="Vento (m/s)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Umidade
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weatherData.slice(0, 10).map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(
                        new Date(item.collection_time * 1000),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.city}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.temperature}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.humidity}%
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.wind_speed} m/s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.weather_condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Card de Insight */}
      <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Insight Climático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                  ✨
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pontuação de Conforto
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${comfortScore ?? 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    {comfortScore !== null ? `${comfortScore}/100` : 'Carregando...'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {comfortScore !== null ? "" : 'Carregando análise de conforto climático...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
