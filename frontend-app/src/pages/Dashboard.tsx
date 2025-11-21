import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Wind, Droplets, Thermometer, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useExportLogs, useInsights, useWeatherLogs } from "@/hooks/useWeather";

export function Dashboard() {
  const navigate = useNavigate()
  const { logs, loading: loadingLogs } = useWeatherLogs()
  const { exportLogs, loading: loadingExport } = useExportLogs()
  const { insights } = useInsights()
  // TanStack Query: Busca, Cache e Loading automático
  const current = logs?.[0]

  const handleLogout = () => {
    localStorage.removeItem('gdash_token')
    navigate({ to: '/auth/login' })
  }

  if (loadingLogs) return <div className="p-8 flex justify-center">Carregando dashboard...</div>

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Monitoramento Climático</h1>
        <div className="space-x-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportLogs('csv')} 
                disabled={loadingExport}
            >
                <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportLogs('xlsx')}
                disabled={loadingExport}
            >
                <Download className="mr-2 h-4 w-4" /> Excel
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-2"></div>

            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
        </div>
      </div>

      {insights && insights.ai_analysis && (
         <Card className="bg-indigo-50 border-indigo-100">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-indigo-700 text-lg">
                    <Sparkles className="mr-2 h-5 w-5" /> Análise de IA
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1">
                    {insights.ai_analysis.map((msg: string, idx: number) => (
                        <li key={idx} className="text-indigo-900 font-medium text-sm">• {msg}</li>
                    ))}
                </ul>
            </CardContent>
         </Card>
      )}

      {current && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.temperature.toFixed(1)}°C</div>
            </CardContent>
          </Card>
          <Card>
             {/* ... (Cards de Umidade e Vento iguais ao anterior) */}
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