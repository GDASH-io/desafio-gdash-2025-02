import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [logsRes, insightsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/weather/logs'),
                axios.get('http://localhost:3001/api/weather/insights')
            ]);
            setLogs(logsRes.data);
            setInsights(insightsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleExport = (type: 'csv' | 'xlsx') => {
        window.open(`http://localhost:3001/api/weather/export.${type}`, '_blank');
    };

    if (loading) return <div className="p-8">Carregando dashboard...</div>;

    const latest = logs && logs.length > 0 ? logs[0] : { temperature: '-', humidity: '-', wind_speed: '-', precipitation: '-' };

    return (
        <div className="min-h-screen bg-transparent p-4 sm:p-8">
            <nav className="glass rounded-2xl mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gradient">GDASH Clima</h1>
                        </div>
                        <div className="flex items-center space-x-6">
                            <span className="text-gray-600 font-medium">Bem-vindo, {user?.name}</span>
                            <a href="/explore" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Explorar</a>
                            <a href="/users" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Usuários</a>
                            <button onClick={logout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Insights Section */}
                {insights && insights.insights && (
                    <div className="mb-8 glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">✨</span> Insights de IA
                            </h3>
                            <div className="bg-blue-50/50 rounded-xl p-4">
                                <ul className="space-y-2">
                                    {insights.insights.map((insight: string, idx: number) => (
                                        <li key={idx} className="text-gray-700 flex items-start">
                                            <span className="text-blue-500 mr-2">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Weather Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="glass-card rounded-2xl p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Temperatura</dt>
                        <dd className="mt-2 text-4xl font-bold text-gray-900">{latest.temperature !== '-' ? `${latest.temperature}°C` : '-'}</dd>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Umidade</dt>
                        <dd className="mt-2 text-4xl font-bold text-gray-900">{latest.humidity !== '-' ? `${latest.humidity}%` : '-'}</dd>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Velocidade do Vento</dt>
                        <dd className="mt-2 text-4xl font-bold text-gray-900">{latest.wind_speed !== '-' ? `${latest.wind_speed}` : '-'} <span className="text-lg font-normal text-gray-500">km/h</span></dd>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Precipitação</dt>
                        <dd className="mt-2 text-4xl font-bold text-gray-900">{latest.precipitation !== '-' ? `${latest.precipitation}` : '-'} <span className="text-lg font-normal text-gray-500">mm</span></dd>
                    </div>
                </div>

                {/* Charts */}
                <div className="glass-card rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico de Temperatura</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={logs && logs.length > 0 ? [...logs].reverse() : []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="createdAt"
                                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#9ca3af"
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleString()}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Table & Export */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Registros Recentes</h3>
                        <div className="space-x-3">
                            <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Exportar CSV</button>
                            <button onClick={() => handleExport('xlsx')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Exportar XLSX</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Umidade (%)</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vento (km/h)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/30 divide-y divide-gray-200/50">
                                {logs && logs.length > 0 ? logs.slice(0, 10).map((log: any) => (
                                    <tr key={log._id} className="hover:bg-white/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.temperature}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.humidity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.wind_speed}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum dado meteorológico disponível</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
