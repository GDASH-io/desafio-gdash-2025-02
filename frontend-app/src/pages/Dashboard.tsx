import { useQuery } from "@tanstack/react-query";
import { api } from "../service/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Wind, Droplets, Thermometer } from "lucide-react";

// Tipagem dos dados (igual ao Backend)
interface WeatherLog {
  id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  collectedAt: string;
  location: { lat: number; lon: number };
}

export function Dashboard() {
  // TanStack Query: Busca, Cache e Loading automático
  const { data: logs, isLoading } = useQuery<WeatherLog[]>({
    queryKey: ['weather-logs'],
    queryFn: async () => {
      const res = await api.get('/weather/logs');
      return res.data;
    },
    refetchInterval: 5000 
  });

  const current = logs?.[0];

  const handleExport = (type: 'xlsx' | 'csv') => {
   
    
    api.get(`/weather/logs/export/${type}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `clima_logs.${type}`);
        document.body.appendChild(link);
        link.click();
      });
  };

  if (isLoading) return <div className="p-8">Carregando dados climáticos...</div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Monitoramento Climático</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={() => handleExport('xlsx')}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      {current && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura Atual</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.temperature.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Última atualização: {new Date(current.collectedAt).toLocaleTimeString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.humidity}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.windSpeed} km/h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>Umidade (%)</TableHead>
                <TableHead>Vento (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.slice(0, 10).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.collectedAt).toLocaleString()}</TableCell>
                  <TableCell>{log.temperature}</TableCell>
                  <TableCell>{log.humidity}%</TableCell>
                  <TableCell>{log.windSpeed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}