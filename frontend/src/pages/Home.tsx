import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StatsGrid } from '../components/sections/StatsGrid';
import { WeatherTable } from '../components/sections/WeatherTable';
import { LocationManager } from '../components/sections/LocationManager';
import { Combobox } from '../components/ui/combobox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

type WeatherRecord = {
    city: string;
    condition?: string;
    temperatureC: number;
    humidityPercent?: number;
    windSpeedKmh?: number;
    collectedAt: string;
};

type Insights = {
    windowHours?: number;
    samples?: number;
    message?: string;
    aiSummary?: string;
    comfortRanking?: { city: string; comfortIndex: number | null; narrative: string }[];
    model?: string;
    createdAt?: string;
};

type Location = {
    _id?: string;
    name: string;
    latitude: number;
    longitude: number;
    active: boolean;
};

interface HomeProps {
    logs: WeatherRecord[];
    logPage: number;
    logTotalPages: number;
    cities: string[];
    cityFilter: string;
    setCityFilter: (value: string) => void;
    insightCity: string;
    setInsightCity: (value: string) => void;
    insightLogs: WeatherRecord[];
    insights: Insights | null;
    insightsLoading: boolean;
    locations: Location[];
    locationPage: number;
    locationTotalPages: number;
    loading: boolean;
    onRefresh: () => void;
    onExport: (type: 'csv' | 'xlsx') => void;
    onAddLocation: (payload: { name: string; latitude: number; longitude: number }) => Promise<void>;
    onDeleteLocation: (id?: string) => Promise<void>;
    onGenerateInsights: () => Promise<void>;
    onLogPageChange: (direction: 'prev' | 'next') => void;
    onLocationPageChange: (direction: 'prev' | 'next') => void;
}

export function Home({
    logs,
    logPage,
    logTotalPages,
    cities,
    cityFilter,
    setCityFilter,
    insightCity,
    setInsightCity,
    insightLogs,
    insights,
    insightsLoading,
    locations,
    locationPage,
    locationTotalPages,
    loading,
    onRefresh,
    onExport,
    onAddLocation,
    onDeleteLocation,
    onGenerateInsights,
    onLogPageChange,
    onLocationPageChange
}: HomeProps) {
    const defaultAiSummary = 'Nenhum insight de IA disponível ainda. Gere dados e tente novamente.';
    const [tab, setTab] = useState<'dashboard' | 'reports'>('dashboard');
    const cityOptions = useMemo(() => cities, [cities]);
    const comfortRanking = useMemo(() => insights?.comfortRanking ?? [], [insights]);
    const aiSummary = insights?.aiSummary?.trim();
    const validAiSummary = aiSummary && aiSummary !== defaultAiSummary ? aiSummary : undefined;
    const messageFallback = insights?.message?.trim();
    const aiModel = insights?.model ?? 'gpt-4o-mini';
    const insightWindow = insights?.windowHours;
    const insightSamples = insights?.samples;
    const insightCreatedAt = insights?.createdAt
        ? new Date(insights.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        : null;

    useEffect(() => {
        if (!cityOptions.length) {
            setInsightCity('all');
        } else if (insightCity !== 'all' && !cityOptions.includes(insightCity)) {
            setInsightCity('all');
        }
    }, [cityOptions, insightCity, setInsightCity]);

    const cards = useMemo(() => {
        if (!insightLogs.length) {
            return [
                { label: 'Temperatura média (24h)', value: '--' },
                { label: 'Umidade média', value: '--' },
                { label: 'Última condição', value: '--' },
                { label: 'Tendência', value: '--' }
            ];
        }
        const temps = insightLogs.map((i) => i.temperatureC).filter((v) => typeof v === 'number');
        const hums = insightLogs
            .map((i) => (i.humidityPercent !== undefined ? i.humidityPercent : null))
            .filter((v): v is number => v !== null);
        const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
        const sorted = [...insightLogs].sort(
            (a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime()
        );
        const trendDiff = sorted.length >= 2 ? sorted[sorted.length - 1].temperatureC - sorted[0].temperatureC : 0;
        const trend = trendDiff > 0 ? 'subindo' : trendDiff < 0 ? 'caindo' : 'estável';
        const last = sorted[sorted.length - 1];
        return [
            { label: 'Temperatura média (24h)', value: `${avg(temps).toFixed(1)} °C` },
            { label: 'Umidade média', value: `${avg(hums).toFixed(1)}%` },
            { label: 'Última condição', value: last.condition ?? '--' },
            { label: 'Tendência', value: trend }
        ];
    }, [insightLogs]);

    return (
        <>
        <Tabs value={tab} onValueChange={(val) => setTab(val as 'dashboard' | 'reports')} className="space-y-4">
            <TabsList>
                <TabsTrigger value="dashboard">Home</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm theme-muted text-nowrap">Insights da cidade:</p>
                    <Combobox
                        className="w-56"
                        value={insightCity}
                        onChange={setInsightCity}
                        options={[
                            { label: 'Todas as cidades', value: 'all' },
                            ...cityOptions.map((city) => ({ label: city, value: city }))
                        ]}
                        placeholder="Selecione a cidade"
                    />
                </div>

                <StatsGrid items={cards} />

                <div className="flex flex-col gap-4">
                    <WeatherTable
                        logs={logs}
                        filters={
                        <Combobox
                            className="w-56"
                            value={cityFilter}
                            onChange={(value) => setCityFilter(value)}
                            options={[
                                { label: 'Todas as cidades', value: 'all' },
                                ...cityOptions.map((c) => ({ label: c, value: c }))
                            ]}
                            placeholder="Filtrar cidade"
                        />
                        }
                        pagination={{
                            page: logPage,
                            totalPages: Math.max(1, logTotalPages),
                            onPrev: () => onLogPageChange('prev'),
                            onNext: () => onLogPageChange('next')
                        }}
                        onRefresh={onRefresh}
                        onExport={onExport}
                        loading={loading}
                    />
                    <LocationManager
                        locations={locations}
                        onAdd={onAddLocation}
                        onDelete={onDeleteLocation}
                        pagination={{
                            page: locationPage,
                            totalPages: Math.max(1, locationTotalPages),
                            onPrev: () => onLocationPageChange('prev'),
                            onNext: () => onLocationPageChange('next')
                        }}
                    />
                </div>

            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text)]">Insights por IA</p>
                        <p className="text-xs text-[var(--muted)]">
                            Geração única com base nas leituras mais recentes. Um clique roda o mesmo pipeline de IA.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={onGenerateInsights} disabled={insightsLoading}>
                            {insightsLoading ? 'Gerando...' : 'Gerar insights por IA'}
                        </Button>
                    </div>
                </div>

                <Card className="space-y-3 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Resumo da IA</p>
                            <p className="text-xs text-[var(--muted)]">
                                Baseado em {insightCity === 'all' ? 'todas as cidades' : insightCity}.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                            <span className="rounded-full bg-[var(--table-header)] px-2 py-1 text-[var(--text)]">
                                Modelo: {aiModel}
                            </span>
                            {insightWindow ? (
                                <span className="rounded-full bg-[var(--table-header)] px-2 py-1 text-[var(--text)]">
                                    Janela: últimas {insightWindow}h
                                </span>
                            ) : null}
                            {typeof insightSamples === 'number' ? (
                                <span className="rounded-full bg-[var(--table-header)] px-2 py-1 text-[var(--text)]">
                                    Amostras: {insightSamples}
                                </span>
                            ) : null}
                            {insightCreatedAt ? (
                                <span className="rounded-full bg-[var(--table-header)] px-2 py-1 text-[var(--text)]">
                                    Gerado em: {insightCreatedAt}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    {insightsLoading ? (
                        <p className="text-sm text-[var(--muted)]">Gerando novo resumo...</p>
                    ) : null}
                    {validAiSummary ? (
                        <div className="space-y-2 text-sm text-gray-500 [&_*]:leading-relaxed [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-gray-500">
                            <ReactMarkdown>{validAiSummary}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 whitespace-pre-line">
                            Nenhum insight gerado pela IA ainda. Clique em "Gerar insights por IA" para criar o primeiro
                            resumo.
                        </p>
                    )}
                    {messageFallback && (
                        <div className="rounded-[10px] border border-[var(--border)] bg-[var(--table-header)] px-3 py-2">
                            <p className="text-xs font-semibold text-[var(--text)]">Notas rápidas</p>
                            <p className="text-xs text-[var(--muted)]">{messageFallback}</p>
                        </div>
                    )}
                </Card>

                <Card className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--text)]">Ranking de conforto (top 3)</p>
                        <p className="text-xs text-[var(--muted)]">Com base nas últimas 24h</p>
                    </div>
                    {comfortRanking.length ? (
                        <div className="space-y-2">
                            {comfortRanking.map((item, index) => (
                                <div
                                    key={item.city}
                                    className="flex flex-wrap justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-[var(--muted)]">#{index + 1}</span>
                                        <p className="text-sm font-semibold text-[var(--text)]">{item.city}</p>
                                    </div>
                                    <div className="flex flex-col text-right text-xs text-[var(--muted)]">
                                        <span>Conforto: {item.comfortIndex ?? 'N/A'}</span>
                                        <span className="text-[var(--text)]">{item.narrative}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--muted)]">Sem dados suficientes para ranquear.</p>
                    )}
                </Card>

               
            </TabsContent>
        </Tabs>
        </>
    );
}
