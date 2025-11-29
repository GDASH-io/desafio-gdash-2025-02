import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLog } from '@/types/weather';

interface TimeChartProps {
    history: WeatherLog[];
}

const prepareChartData = (history: WeatherLog[]) => {
    const reversedHistory = [...history].reverse();

    return reversedHistory.map(log => ({
        name: new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temp: log.temp_c,
        rain: log.rain_prob,
        timestamp: log.createdAt,
    }));
};

export function TimeChart({ history }: TimeChartProps) {
    const data = prepareChartData(history);

    const chartData = data.slice(-24);

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 backdrop-blur border-slate-800 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-300">
                    Tendência de Temperatura (Últimas Leituras)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#94a3b8" interval={2} />
                            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" width={60}tickFormatter={(value) => `${value.toFixed(1)}°C`}/>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: 'white' }} />
                            <Legend />
                            <Line type="monotone" dataKey="temp" name="Temperatura" stroke="#fb923c" activeDot={{ r: 8 }} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur border-slate-800 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-300">
                        Probabilidade de Chuva
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#94a3b8" interval={2} />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: 'white' }} />
                            <Legend />
                            <Line type="monotone" dataKey="rain" name="Prob. Chuva" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </section>
    );
}