import { InsightsResponse } from "@/features/weather/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Gauge, Info, Lightbulb, TrendingUp } from "lucide-react";

interface InsightsPanelProps {
    insights: InsightsResponse | undefined;
}

export const InsightsPanel = ({ insights }: InsightsPanelProps) => {
    if (!insights) {
        return (
            <Card className="col-span-full">
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-gray-900">Carregando insights...</p>
                </CardContent>
            </Card>
        );
    }

    const { insights: aiInsights, statistics } = insights;

    const getConfortColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';

        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="space-y-6">
            {/* Confort Score */}
            <Card className="border-l-4 border-l-brand-400">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-brand-500 flex items-center gap-2">
                                <Gauge className="h-5 w-5" />
                                Índice de conforto
                            </CardTitle>
                            <CardDescription>Baseado em temperatura e umidade</CardDescription>
                        </div>
                        <div className={`px-6 py-3 rounded-lg ${getConfortColor(aiInsights.comfortScore)}`}>
                            <span className="text-3xl font-bold">{aiInsights.comfortScore}</span>
                            <span className="text-sm ml-1">/100</span>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-brand-500">Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-900 leading-relaxed">{aiInsights.summary}</p>
                </CardContent>
            </Card>

            {/* Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-brand-500 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Tendências Observadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {aiInsights.trends.map((trend, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <span className="text-brand-400 mt-1">•</span>
                                <span className="text-gray-900">{trend}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Alerts */}
            {aiInsights.alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-brand-500">Alertas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {aiInsights.alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                    alert.type === 'warning'
                                        ? 'bg-yellow-50 border border-yellow-200'
                                        : 'bg-blue-50 border border-blue-200'
                                }`}
                            >
                                {alert.type === 'warning' ? (
                                    <AlertTriangle className="h-5 w-5 text-yello-600 shrink-0 mt-0.5" />
                                ) : (
                                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                )}
                                <span className={alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>
                                    {alert.message}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-brand-500 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recomendações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {aiInsights.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-brand-500 mt-1">→</span>
                                <span className="text-gray-900">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-brand-500">Estatísticas do Periíodo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Temp. Média</p>
                            <p className="text-xl font-bold text-brand-500">
                                {statistics.avgTemperature.toFixed(1)}°C
                            </p>
                        </div>
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Temp. Mínima</p>
                            <p className="text-xl font-bold text-blue-600">
                                {statistics.minTemperature.toFixed(1)}°C
                            </p>
                        </div>
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Temp. Máxima</p>
                            <p className="text-xl font-bold text-red-600">
                                {statistics.maxTemperature.toFixed(1)}°C
                            </p>
                        </div>
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Umidade Média</p>
                            <p className="text-xl font-bold text-brand-600">
                                {statistics.avgHumidity.toFixed(0)}%
                            </p>
                        </div>
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Vento Médio</p>
                            <p className="text-xl font-bold text-brand-700">
                                {statistics.avgWindSpeed.toFixed(1)} km/h
                            </p>
                        </div>
                        <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-900 mb-1">Registros</p>
                            <p className="text-xl font-bold text-brand-500">
                                {statistics.totalRecords.toFixed(1)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};