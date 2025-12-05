import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wind, Droplets, Thermometer, MapPin, BrainCircuit, Info, Clock, CloudSun, Zap, TrendingUp, TrendingDown, Minus, Sparkle } from "lucide-react";

import type { WeatherLog } from '@/types/api/weather.types'

import TemperatureTrendChart from '@/components/TemperatureTrendChart';
import { SolarRadiationChart } from '@/components/SolarRadiationChart';
import {SolarGenerationChart} from '@/components/SolarGenerationChart';
import { SolarEfficiencyChart } from '@/components/SolarEfficiencyChart';
import { Spinner } from '@/components/ui/spinner';
import { ExportButtons } from '@/components/ExportButtons';
import { Progress } from '@/components/ui/progress';


export default function Dashboard() {
  const navigate = useNavigate();
  const [latestLog, setLatestLog] = useState<WeatherLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const chartData = latestLog?.insights?.temperature_trend_chart?.data  || [];
  const tminTrend = latestLog?.insights?.temperature_trend_chart?.trend.tmin
  const tmaxTrend = latestLog?.insights?.temperature_trend_chart?.trend.tmax
  
  const solarDataChart = latestLog?.insights?.next_7_days?.map( day => ({
    date: day.date,
    solar_radiation: day.solar_radiation
  }))

  const solarGenerationDataChart = latestLog?.insights?.next_7_days?.map( day => ({
    date: day.date,
    estimated_generation_kwh: day.estimated_generation_kwh
  }))

  const solarEfficiency = latestLog?.insights?.solar_efficiency_index || 0


  // --- LÓGICA DE FETCH (A lógica de autenticação está no Layout) ---
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch('http://localhost:3000/api/weather/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Usa o último registro
          setLatestLog(data[data.length - 1]);
          setLastUpdated(new Date());
        }
      } else if (res.status === 401 || res.status === 403) {
        // Se a API retornar erro de Auth, desloga
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        navigate('/login');
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Atualização automática a cada 10s
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (direction: 'increasing' | 'decreasing' | 'stable') => {
    switch(direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-teal-500" />;
      default: return <Minus className="h-4 w-4 text-slate-500" />;
    }
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard de Telemetria</h1>
      <div className='flex items-center gap-1'>
        <MapPin className='text-slate-400 size-5 stroke-[1.5]'/>
        <p className="text-slate-400 text-xl">{latestLog?.location || "N/A"}</p>
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        {latestLog ? (
          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
           Última leitura: { new Date(latestLog.createdAt).toLocaleTimeString() }
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 gap-1">
           <Spinner/>
           Carregando...
          </Badge>
        )}

        <div className='flex flex-col gap-1 items-end'>
          <ExportButtons/>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Última atualização da tela: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        </div>
      </div>

        
      <Separator className="my-4" />

      {/* --- LOADING / EMPTY STATE --- */}
      {loading && !latestLog && (
          <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Conectando ao Sistema</AlertTitle>
          <AlertDescription className="text-blue-600">
            Aguardando dados da telemetria...
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card className="flex w-full flex-row gap-4 justify-center items-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Spinner className='text-slate-500 size-5'/>
          <p className="text-slate-500">Carregando dados da API...</p>
        </Card>
      )}

      {!loading && !latestLog && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum dado recebido ainda.</p>
          <p className="text-sm text-slate-400">Verifique se o coletor Python está enviando dados.</p>
        </div>
      )}

      {/* --- DASHBOARD GRID (SÓ APARECE SE TIVER DADOS) --- */}
      {latestLog && (
        <div className="space-y-4">
          
          {/* Linha 1: Métricas Principais (Físicas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            
            {/* Card Temperatura */}
            <Card className="0 bg-white shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Temperatura
                  <Thermometer className="size-5"/>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {latestLog.temperature_c?.toFixed(1)}°C
                </div>
                {latestLog.insights?.comfort_now !== undefined && (
                  <p className="text-xs text-slate-400 mt-1">
                    Conforto: <span className="font-semibold text-emerald-600">{latestLog.insights.comfort_now}/100</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card Umidade */}
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Umidade
                  <Droplets className="size-5"/>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {latestLog.humidity_percent}%
                </div>
                {latestLog.insights?.uv_alert && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    {latestLog.insights.uv_alert}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card Vento / Condição */}
            <Card className="bg-white shadow-sm hover:shadow-md transition-all grid-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Vento / Condição
                  <Wind  className="size-5"/>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 capitalize leading-tight">
                  {latestLog.condition}
                </div>
                <p className="text-xs text-slate-400 mt-1">Vento: {latestLog.wind_speed_kmh?.toFixed(1)} km/h</p>
              </CardContent>
            </Card>

            {/* Card Insights Rápidos */}
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Eficiência Solar
                  <Progress value={solarEfficiency}  className="flex-1 max-w-10"/>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-1">
                  <p className="text-xl font-bold text-slate-900 capitalize leading-tight">{solarEfficiency} %</p>
                  {latestLog.insights?.solar_recommendation && (
                    <div className='flex items-center gap-1'>
                      <Sparkle className="size-4 text-teal-500/80" />
                      <p className="text-xs text-teal-500/80">
                        {latestLog.insights.solar_recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
          {/* Linha 2: Previsão de 7 Dias */}
          {latestLog.insights?.next_7_days && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CloudSun className="size-5 text-teal-600" />
                  Previsão Estendida & Potencial Solar
                </CardTitle>
                <CardDescription>Análise diária para os próximos dias, focada em geração de energia.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2`}>
                  {latestLog.insights.next_7_days.map((day, i) => {
                    const date = new Date(day.date + "T12:00:00")
                    const dateFmt = date.toLocaleDateString("pt-BR", { weekday: 'short', day: "2-digit", month: "numeric" });

                    return (
                      <Card key={i} className={`p-4 border border-slate-100 shadow-sm space-y-2 ${day.rain > 30 ? 'bg-blue-50/70 border-blue-200' : 'bg-green-50/70 border-green-200'}`}>
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="text-sm font-semibold uppercase">{dateFmt}</span>
                              <span className='text-2xl'>{day.icon}</span>
                          </div>
                          
                          {/* Temperaturas & Chuva */}
                          <div className="flex justify-between text-sm font-medium">
                              <span className="text-orange-600">Max: {day.tmax}°C</span>
                              <span className="text-teal-700">Min: {day.tmin}°C</span>
                              <span className="text-teal-500">Chuva: {day.rain}%</span>
                          </div>

                          <Separator />

                          {/* Destaque Solar */}
                          {day.estimated_generation_kwh !== undefined && (
                              <div className="pt-2">
                                  <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                      <Zap className="h-4 w-4" /> Geração Est.: <span className="text-lg font-bold">{day.estimated_generation_kwh}</span> kWh
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">Radiação: {day.solar_radiation} Wh/m²</p>
                              </div>
                          )}

                          {/* Tips/Recomendações */}
                          <div className="pt-2 space-y-1">
                              {day.solar_recommendations?.map((rec, idx) => (
                                  <Badge key={`solar-rec-${idx}`} variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs py-0.5 px-1.5">
                                      {rec}
                                  </Badge>
                              ))}
                              {day.solar_recommendations && <Separator/>}
                              {day.daily_tips?.map((tips, index) => (
                                <Badge key={`daily-tips-${index}`}>
                                  {tips}
                                </Badge>
                              ))}
                          </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Linha 3: Graficos */}
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-2'>
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className='size-5 text-teal-600'/>
                  Tendência de temperatura para a próxima semana
                </CardTitle>
                <CardDescription>
                  {/* ---- Tendências Numéricas ---- */}
                  {tminTrend && tmaxTrend && (
                    <div className="flex items-center gap-4">

                      {/* TREND TMIN */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Mínima:</span>
                        {getTrendIcon(tminTrend?.direction)}
                        <span className="text-sm font-semibold">
                          {tminTrend.slope}°C
                        </span>
                      </div>

                      {/* TREND TMAX */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Máxima:</span>
                        {getTrendIcon(tmaxTrend.direction)}
                        <span className="text-sm font-semibold">
                          {tmaxTrend.slope}°C
                        </span>
                      </div>

                    </div>
                    )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

              

              {/* ---- Gráfico ---- */}
            <TemperatureTrendChart data={chartData}/>
            </CardContent>
            </Card>
            <Card className='bg-white'>
                <CardHeader>
                  <CardTitle  className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Zap className='size-4 text-teal-600'/>
                    Radiação Solar
                  </CardTitle>
                  <CardDescription>Próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <SolarRadiationChart data={solarDataChart}/>
                </CardContent>
            </Card>
            <Card className='bg-white'>
                <CardHeader>
                  <CardTitle  className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Zap className='size-4 text-teal-600'/>
                    Geração Solar Estimada (KW/h)
                  </CardTitle>
                  <CardDescription>Próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <SolarGenerationChart data={solarGenerationDataChart}/>
                </CardContent>
            </Card>
            </div>
          </div>
        )}
      </div>
  );
}