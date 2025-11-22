import { useWeatherLogs, useExportLogs, useInsights } from "@/hooks/useWeather"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, Wind, Droplets, Thermometer, Sparkles, 
  CloudSun, 
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { SideBar } from "@/components/SideBar"

export function Dashboard() {

  const { logs, loading: loadingLogs } = useWeatherLogs()
  const { exportLogs, loading: loadingExport } = useExportLogs()
  const { insights } = useInsights()

  const current = logs?.[0]

  // Prepara dados para o gráfico (inverte para ficar cronológico: antigo -> novo)
  const chartData = logs?.slice(0, 24).reverse().map(log => ({
    time: new Date(log.collectedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: log.temperature,
    hum: log.humidity
  }))


  if (loadingLogs) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <CloudSun className="h-12 w-12 text-blue-500" />
        <span className="text-lg font-medium">Carregando satélites...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      
      {/* --- SIDEBAR --- */}
      <SideBar/>
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header Mobile e Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Monitoramento Climático
            </h1>
            <p className="text-slate-400 mt-1">Acompanhamento em tempo real da sua usina.</p>
          </div>

          <div className="flex gap-2">
             <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => exportLogs('csv')} disabled={loadingExport}>
                <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => exportLogs('xlsx')} disabled={loadingExport}>
                <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        {/* GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* COLUNA 1: Métricas Principais (Estilo Widget) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico Principal */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Tendência de Temperatura (24h)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="°C" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cards Menores em Grid */}
            {current && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Thermometer className="h-24 w-24 text-orange-500" />
                   </div>
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Temperatura</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-4xl font-bold text-slate-100">{current.temperature.toFixed(1)}°C</div>
                      <Badge variant="outline" className="mt-2 text-orange-400 border-orange-400/20 bg-orange-400/10">Tempo Real</Badge>
                   </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Droplets className="h-24 w-24 text-blue-500" />
                   </div>
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Umidade</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-4xl font-bold text-slate-100">{current.humidity}%</div>
                      <Badge variant="outline" className="mt-2 text-blue-400 border-blue-400/20 bg-blue-400/10">Hidratação</Badge>
                   </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wind className="h-24 w-24 text-emerald-500" />
                   </div>
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Vento</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-4xl font-bold text-slate-100">{current.windSpeed} <span className="text-lg text-slate-500">km/h</span></div>
                      <Badge variant="outline" className="mt-2 text-emerald-400 border-emerald-400/20 bg-emerald-400/10">Direção N</Badge>
                   </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* COLUNA 2: Insights + Histórico */}
          <div className="space-y-6">
             
             {/* Card IA com Gradiente */}
            <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Sparkles className="mr-2 h-5 w-5 text-yellow-300" /> IA Insights
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                        Análise inteligente do ambiente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {insights?.ai_analysis ? (
                        <ul className="space-y-3">
                            {insights.ai_analysis.map((msg: string, idx: number) => (
                                <li key={idx} className="text-sm font-medium bg-white/10 p-2 rounded backdrop-blur-sm border border-white/10">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm opacity-70">Coletando dados para análise...</div>
                    )}
                </CardContent>
            </Card>

            {/* Tabela Compacta */}
            <Card className="bg-slate-900 border-slate-800 h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-slate-100">Histórico Recente</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto pr-2 custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-800 border-slate-800">
                                <TableHead className="text-slate-400">Hora</TableHead>
                                <TableHead className="text-slate-400 text-right">Temp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.slice(0, 15).map((log) => (
                                <TableRow key={log.id} className="hover:bg-slate-800 border-slate-800">
                                    <TableCell className="text-slate-300 font-mono text-xs">
                                        {new Date(log.collectedAt).toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-300 font-bold">
                                        {log.temperature}°
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}