import { SideBar } from "@/components/SideBar"
import { Thermometer, Droplets, Wind } from "lucide-react"
import { useWeatherLogs, useExportLogs, useInsights } from "@/hooks/useWeather"
import { CloudSun } from "lucide-react"
import { 
  HeaderActions, 
  TemperatureChart, 
  MetricCard, 
  InsightsCard, 
  LogsTable 
} from "@/components/dashboard"


export function Dashboard() {
  const { logs, loading: loadingLogs } = useWeatherLogs()
  const { exportLogs, loading: loadingExport } = useExportLogs()
  const { insights } = useInsights()

  const current = logs?.[0]

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
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Monitoramento Climático
            </h1>
            <p className="text-slate-400 mt-1">Acompanhamento em tempo real da sua usina.</p>
          </div>
          <HeaderActions exportLogs={exportLogs} loadingExport={loadingExport} />
        </div>

        {/* Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Coluna 1: Gráfico + Métricas */}
          <div className="lg:col-span-2 space-y-6">
            <TemperatureChart data={chartData || []} />

            {current && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  title="Temperatura" 
                  value={current.temperature.toFixed(1)} 
                  unit="°C" 
                  badge="Tempo Real" 
                  icon={Thermometer} 
                  iconColor="text-orange-500" 
                  classBadge="text-orange-400 border-orange-400/20 bg-orange-400/10"
                />
                <MetricCard 
                  title="Umidade" 
                  value={current.humidity} 
                  unit="%" 
                  badge="Hidratação" 
                  icon={Droplets} 
                  iconColor="text-blue-500" 
                  classBadge="text-blue-400 border-blue-400/20 bg-blue-400/10"
                />
                <MetricCard 
                  title="Vento" 
                  value={current.windSpeed} 
                  unit="km/h" 
                  badge="Direção N" 
                  icon={Wind} 
                  iconColor="text-emerald-500" 
                  classBadge="text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                />
              </div>
            )}
          </div>

          {/* Coluna 2: Insights + Histórico */}
          <div className="space-y-6">
            <InsightsCard insights={insights} />
            <LogsTable logs={logs} />
          </div>
        </div>
      </main>
    </div>
  )
}
