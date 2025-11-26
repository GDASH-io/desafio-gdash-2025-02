import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api"; // <--- Importe o nosso api customizado
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Usa 'api' em vez de 'axios'
      const response = await api.get("/weather");
      setWeatherList(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza a cada 2 minutos (120000ms)
  useEffect(() => {
    fetchWeather();
    setInterval(fetchWeather, 120000);
  }, []);
  const current = weatherList[0];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">
            🌦️ Dashboard Climático
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open("http://localhost:3000/weather/export/csv")
              }
            >
              📄 CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
              onClick={() =>
                window.open("http://localhost:3000/weather/export/xlsx")
              }
            >
              📊 Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/pokemon")}
            >
              🐉 Pokémons
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/users")}
            >
              👥 Usuários
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Sair
            </Button>
          </div>
        </div>

        {current ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {current.temperature}°C
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Vento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {current.windspeed} km/h
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700">
                  🤖 Insight IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-blue-900">
                  {current.aiInsight}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center">Carregando dados...</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>Vento</TableHead>
                  <TableHead>Insight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherList.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.temperature}°C</TableCell>
                    <TableCell>{item.windspeed} km/h</TableCell>
                    <TableCell>{item.aiInsight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
