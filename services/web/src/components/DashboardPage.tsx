import { useAuth } from "@/features/auth/hooks/useAuth";
import { useExportWeather, useWeatherInsights, useWeatherLogs } from "@/features/weather/hooks/useWeather";
import { Cloud, Droplets, FileText, Loader2, LogOut, RefreshCw, Thermometer, User, Wind } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { WeatherCard } from "./WeatherCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TemperatureChart } from "./TemperatureChart";
import { InsightsPanel } from "./InsightsPanel";

export const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');

    const { data: weatherLogs, isLoading: logsLoading, refetch: refetchLogs } = useWeatherLogs({ limit: 50 });
    const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useWeatherInsights({ period });
    const { exportCSV, exportXLSX } = useExportWeather();

    const latestLog = weatherLogs?.data[0];
    const isLoading = logsLoading || insightsLoading;

    const handleRefresh = () => {
        refetchLogs();
        refetchInsights();
    };

    return (
        <div className="min-h-screen bg-liner-to-br from-brand-50 via-white to-brand-400/10">
            {/* header */}
            <header className="bg-white border-b border-brand-400/20 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center">
                            <Cloud className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-brand-500">GDASH</h1>
                            <p className="text-xs text-gray-900">Weather Analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="border-brand-400/30"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>

                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-lg">
                            <User className="h-4 w-4 text-brand-500" />
                            <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="border-brand-400/30 hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="container mx-auto px-4 py-8">
                {/* WeatherCard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <WeatherCard
                        title="Temperatura"
                        value={latestLog?.temperature}
                        unit="°C"
                        icon={Thermometer}
                    />
                    <WeatherCard
                        title="Umidade"
                        value={latestLog?.humidity}
                        unit="%"
                        icon={Droplets}
                    />
                    <WeatherCard
                        title="Vento"
                        value={latestLog?.windSpeed}
                        unit="km/h"
                        icon={Wind}
                    />
                    <WeatherCard
                        title="Nuvens"
                        value={latestLog?.cloudCover}
                        unit="%"
                        icon={Cloud}
                    />
                </div>

                {/* Location */}
                {latestLog && (
                    <Card className="mb-8 bg-linear-to-r from-brand-500 to-brand-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">{latestLog.location.city}</h2>
                                    <p className="text-brand-50 opacity-90">
                                        Última atualização: {new Date(latestLog.timestamp).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => exportCSV()}
                                        className="bg-white/20 hover:bg-white-30 text-white border-white/30"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        CSV
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => exportXLSX()}
                                        className="bg-white/20 hover:bg-white-30 text-white border-white/30"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        EXCEL
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Temperature */}
                {weatherLogs?.data && weatherLogs.data.length > 0 && (
                    <div className="mb-8">
                        <TemperatureChart data={weatherLogs.data} />
                    </div>
                )}

                {/* Insights */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-brand-500">Insights de IA</CardTitle>
                                <div className="flex gap-2">
                                    {(['24h', '7d', '30d'] as const).map((p) => (
                                        <Button
                                            key={p}
                                            variant={period === p ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPeriod(p)}
                                            className={period === p ? 'bg-brand-500' : 'border-brand-400/30'}
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {insightsLoading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                        </CardContent>
                    </Card>
                ) : (
                    <InsightsPanel insights={insights} />
                )}

                {/* Empty */}
                {!isLoading && (!weatherLogs?.data || weatherLogs.data.length === 0) && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                            <Cloud className="h-16 w-16 text-brand-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Nenhum dado disponível
                            </h3>
                            <p className="text-gray-900 mb-4">
                                Aguarde a coleta de dados climáticos ou verifique se o sistema está funcionando
                            </p>
                            <Button onClick={handleRefresh} className="bg-brand-500">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Verificar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* footer */}
            <footer className="border-t border-brand-400/20 bg-white mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-900">
                    GDASH Challenge 2025 @ Luís Victor Belo
                </div>
            </footer>
        </div>
    );
};