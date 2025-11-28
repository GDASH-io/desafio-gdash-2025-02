import { useEffect, useState, useCallback, useRef } from "react";
import { Download, LogOut, Wind, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { api, type WeatherLog } from "../services/api";
import { Button } from "../components/ui/button";
import { StatsCards } from "../components/dashboard/StatsCards";
import { TimeSeriesChart } from "../components/dashboard/TimeSeriesChart";
import { InsightPanel } from "../components/dashboard/InsightPanel";

interface DashboardPageProps {
  token: string;
  onLogout: () => void;
}

export function DashboardPage({ token, onLogout }: DashboardPageProps) {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasLoadedRef = useRef(false);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().split('T')[0];
  });

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchData = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh && !hasLoadedRef.current) setIsLoading(true);

    try {
      const data = await api.getLogs(token, selectedDate);
      const sorted = data.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setLogs(sorted);
      hasLoadedRef.current = true;
    } catch (error: any) {
      console.error("Erro dashboard:", error);
      if (error.status === 401 || error.message?.includes('401')) {
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedDate, onLogout]);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => {
        const local = new Date();
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        const todayStr = local.toISOString().split('T')[0];
        
        if (selectedDate === todayStr) {
            fetchData(true);
        }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData, selectedDate]);

  const lastLog = logs.length > 0 ? logs[logs.length - 1] : undefined;
  const displayDate = formatDisplayDate(selectedDate);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur px-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <Wind className="h-6 w-6 text-blue-600" />
          <span className="hidden sm:inline">GDASH</span>
        </div>
        
        <div className="relative flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-slate-200 hover:border-blue-400 transition-colors shadow-sm cursor-pointer group w-[160px]">
            <CalendarIcon className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-slate-700 select-none">
                {displayDate}
            </span>
            <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                    hasLoadedRef.current = false;
                    setSelectedDate(e.target.value);
                }}
                onClick={(e) => {
                    try {
                        if ('showPicker' in e.currentTarget) {
                            (e.currentTarget as any).showPicker();
                        }
                    } catch (err) {}
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Alterar data"
            />
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => api.downloadFile(token, 'csv')} title="Exportar CSV">
             <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">CSV</span>
           </Button>
           <Button variant="outline" size="sm" onClick={() => api.downloadFile(token, 'xlsx')} title="Exportar Excel">
             <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">XLSX</span>
           </Button>
           <div className="h-6 w-px bg-slate-200 mx-2"></div>
           <Button variant="ghost" size="icon" onClick={onLogout} title="Sair">
             <LogOut className="h-5 w-5 text-red-500" />
           </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Monitoramento Climático</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              Visualizando dados de: <span className="font-semibold text-blue-600">{displayDate}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
              {logs.length} registros encontrados
            </div>
          </div>
        </div>

        <StatsCards lastLog={lastLog} />

        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-4 h-full">
             <TimeSeriesChart 
               data={logs} 
               title={`Temperatura (${displayDate})`} 
               dataKey="temperature" 
               color="#ef4444"
               unit="°C"
               gradientId="gradTemp"
             />
          </div>
          <div className="md:col-span-3 h-full">
            {/* ATUALIZADO: Passando selectedDate */}
            <InsightPanel token={token} selectedDate={selectedDate} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-slate-800 pt-4">Métricas Detalhadas</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <TimeSeriesChart 
             data={logs} 
             title="Umidade" 
             dataKey="humidity" 
             color="#3b82f6"
             unit="%"
             gradientId="gradHum"
           />
           <TimeSeriesChart 
             data={logs} 
             title="Vento" 
             dataKey="wind_speed" 
             color="#64748b"
             unit=" km/h"
             gradientId="gradWind"
           />
           <TimeSeriesChart 
             data={logs} 
             title="Radiação" 
             dataKey="radiation" 
             color="#f59e0b"
             unit=" W/m²"
             gradientId="gradRad"
           />
        </div>

      </main>
    </div>
  );
}