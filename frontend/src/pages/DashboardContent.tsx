import { useMemo } from 'react';
import { useWeather } from "@/hooks/useWeather";
import { StatCard } from "@/components/custom/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Activity, CloudRain } from "lucide-react";
import { getWeatherCondition } from "@/utils/weatherCodes";
import { TimeChart } from '@/components/custom/TimeChart';
import { WeatherLog } from "@/types/weather"; 

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
};

export function DashboardContent() {
    const { current, history, insight, loading } = useWeather();
    const condition = current ? getWeatherCondition(current.condition_code) : null;

    const TableHistory = useMemo(() => {
        if (!history || history.length === 0) return null;
        return (
            <Card className="bg-slate-900/40 backdrop-blur border-slate-800 text-slate-100">
                <CardHeader><CardTitle className="text-lg font-semibold text-slate-300">Histórico de Telemetria</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-md border border-slate-800">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Horário</th>
                                    <th className="px-6 py-4 font-medium">Condição</th>
                                    <th className="px-6 py-4 font-medium">Temp</th>
                                    <th className="px-6 py-4 font-medium">Chuva %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.slice(0, 8).map((log: WeatherLog) => (
                                    <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-300">{formatDate(log.createdAt)}</td>
                                        <td className="px-6 py-4 text-slate-200">{getWeatherCondition(log.condition_code).label}</td>
                                        <td className="px-6 py-4 text-slate-200">{log.temp_c.toFixed(1)}°C</td>
                                        <td className="px-6 py-4 text-slate-200">{log.rain_prob}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        );
    }, [history]);

    if (loading && !current) {
        return <div className="text-center py-20 text-slate-500 animate-pulse">Carregando telemetria...</div>;
    }

    return (
        <div className="space-y-10 mt-6 animate-in fade-in duration-500">
            {current && condition && (
                <div className="space-y-6">
                    <div className="flex items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-sm">
                        <condition.icon className={`h-16 w-16 mr-6 ${condition.color}`} />
                        <div>
                            <h2 className="text-3xl font-bold text-white">{condition.label}</h2>
                            <p className="text-slate-400">Condição Atual</p>
                        </div>
                    </div>
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Temperatura" value={current.temp_c.toFixed(1)} unit="°C" subtitle="Zona Térmica" icon={Thermometer} iconColor="text-orange-500" />
                        <StatCard title="Umidade" value={current.humidity} unit="%" subtitle="Umidade Relativa" icon={Droplets} iconColor="text-blue-500" />
                        <StatCard title="Vento" value={current.wind_speed} unit="km/h" subtitle="Velocidade" icon={Wind} iconColor="text-emerald-500" />
                        <StatCard title="Chuva" value={current.rain_prob} unit="%" subtitle="Probabilidade (Hora)" icon={CloudRain} iconColor="text-indigo-400" />
                    </section>
                </div>
            )}

            {insight && (
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-slate-100 shadow-lg">
                     <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Activity className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-sm font-medium text-purple-300 uppercase tracking-wider">Análise Inteligente (IA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <p className="text-lg font-light leading-relaxed text-slate-200">{insight.analysis_text}</p>
                            </div>
                            <div className="flex gap-8 text-sm border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                                <div><p className="text-slate-500">Tendência</p><p className="font-semibold text-slate-200 capitalize">{insight.trend}</p></div>
                                <div><p className="text-slate-500">Média</p><p className="font-semibold text-slate-200">{insight.average_last_10}°C</p></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {history && history.length > 0 && <TimeChart history={history} />}
            {TableHistory}
        </div>
    );
}