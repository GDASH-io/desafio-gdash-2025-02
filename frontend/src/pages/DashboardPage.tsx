import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { useEffect, useState } from "react";
// Ícones do Lucide (já vem com Shadcn)
import {
  CloudSun,
  FileSpreadsheet,
  FileText,
  Info,
  LogOut,
  RefreshCw,
  Users,
  Wind,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await api.get("/weather");
      setWeatherList(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    setInterval(fetchWeather, 120000);
  }, []);
  const current = weatherList[0];

  return (
    // Fundo com gradiente suave
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- CABEÇALHO --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CloudSun className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Weather Monitor
              </h1>
              <p className="text-sm text-slate-500">
                Painel de controle em tempo real
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open("http://localhost:3000/weather/export/csv")
              }
            >
              <FileText className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-50"
              onClick={() =>
                window.open("http://localhost:3000/weather/export/xlsx")
              }
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = "/pokemon")}
            >
              <Zap className="w-4 h-4 mr-2 text-yellow-600" /> Pokédex
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = "/users")}
            >
              <Users className="w-4 h-4 mr-2" /> Usuários
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/about")}
            >
              <Info className="w-4 h-4 mr-2" /> Sobre
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* --- CARDS PRINCIPAIS --- */}
        {current ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Temperatura */}
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-100 font-medium text-sm uppercase tracking-wider">
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter">
                    {Math.round(current.temperature)}°
                  </span>
                  <span className="text-2xl text-blue-200">C</span>
                </div>
                <p className="text-blue-100 mt-2 text-sm opacity-90">
                  Última atualização:{" "}
                  {new Date(current.createdAt).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>

            {/* Card Vento */}
            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                  Velocidade do Vento
                </CardTitle>
                <Wind className="w-5 h-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-700 mt-2">
                  {current.windspeed}{" "}
                  <span className="text-xl text-slate-400 font-normal">
                    km/h
                  </span>
                </div>
                <div className="mt-4">
                  <Badge
                    variant="secondary"
                    className={
                      current.windspeed > 20
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {current.windspeed > 20 ? "Vento Forte" : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card IA Insight */}
            <Card className="border-blue-200 bg-blue-50 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Zap className="w-24 h-24 text-blue-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-700 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-blue-700" />
                  Análise de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-slate-700 leading-relaxed">
                  "{current.aiInsight}"
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-500">Conectando aos sensores...</p>
          </div>
        )}

        {/* --- TABELA --- */}
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>Histórico de Registros</CardTitle>
            <CardDescription>
              Últimas 20 coletas realizadas pelo sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead>Vento</TableHead>
                  <TableHead>Insight Gerado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherList.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span
                        className={
                          item.temperature > 30
                            ? "text-red-600"
                            : "text-slate-700"
                        }
                      >
                        {item.temperature}°C
                      </span>
                    </TableCell>
                    <TableCell>{item.windspeed} km/h</TableCell>
                    <TableCell
                      className="text-slate-600 text-sm max-w-md truncate"
                      title={item.aiInsight}
                    >
                      {item.aiInsight}
                    </TableCell>
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
