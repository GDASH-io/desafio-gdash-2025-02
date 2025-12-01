
import { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import weatherService from "../../services/weatherService";
import type { WeatherInsights } from "../../services/weatherService";
import { ExportButtons } from "../../components/weather/ExportButtons";
import { WeatherTable } from "../../components/weather/WeatherTable";
import { InsightsPanel } from "../../components/weather/InsightsPanel";
import { WeatherLineChartRecharts } from "../../components/weather/WeatherLineChartRecharts";

function Dashboard() {
    const [insights, setInsights] = useState<WeatherInsights | undefined>();
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState<string | undefined>();
    const [from, setFrom] = useState<string | undefined>();
    const [to, setTo] = useState<string | undefined>();
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        const loadInsights = async () => {
            setInsightsLoading(true);
            setInsightsError(undefined);
            try {
                const data = await weatherService.getInsights({ windowHours: 24 });
                setInsights(data);
            } catch (e: any) {
                setInsightsError(e?.message || "Erro ao carregar insights");
            } finally {
                setInsightsLoading(false);
            }
        };
        loadInsights();
    }, []);

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Visão Geral</h1>
                    <p className="text-sm text-gray-500">Clima Campina Grande</p>
                </div>
                <div className="h-px w-full bg-gray-200" />
                 <InsightsPanel insights={insights} loading={insightsLoading} error={insightsError} />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-gray-600">De</label>
                        <input className="mt-1 w-full border rounded px-2 py-1 text-sm" type="datetime-local" value={from || ""} onChange={(e) => setFrom(e.target.value || undefined)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Até</label>
                        <input className="mt-1 w-full border rounded px-2 py-1 text-sm" type="datetime-local" value={to || ""} onChange={(e) => setTo(e.target.value || undefined)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Limite</label>
                        <input className="mt-1 w-full border rounded px-2 py-1 text-sm" type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="flex items-end justify-end">
                        <ExportButtons from={from} to={to} limit={limit} />
                    </div>
                </div>
                <WeatherLineChartRecharts from={from} to={to} limit={limit} />
                <WeatherTable />
            </div>
        </Layout>
    );
}

export default Dashboard;