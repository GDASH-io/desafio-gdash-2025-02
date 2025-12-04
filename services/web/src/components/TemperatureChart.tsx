import { WeatherLog } from "@/features/weather/types";
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TemperatureChartProps {
    data: WeatherLog[];
}

export const TemperatureChart = ({ data }: TemperatureChartProps) => {
    const chartData = data
        .slice()
        .reverse()
        .map((log) => ({
            time: format(new Date(log.timestamp), 'HH:mm', { locale: ptBR }),
            temperature: log.temperature,
            humidity: log.humidity,
            apparentTemperature: log.apparentTemperature,
        }));

        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle className="text-brand-500">Temperatura ao Longo do Tempo</CardTitle>
                    <CardDescription>Últimas 24 horas de medições</CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis 
                                    dataKey="time"
                                    stroke="#323232"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    stroke="#323232"
                                    style={{ fontSize: '12px' }}
                                    yAxisId="humidity"
                                    orientation="right"
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#f4fdfb',
                                        border: '1px solid #50e3c2',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line 
                                    yAxisId="temp"
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#00947c"
                                    strokeWidth={2}
                                    dot={{ fill: '#00947c', r: 4 }}
                                    name="Temperatura (°C)"
                                />
                                {chartData.some(d => d.apparentTemperature) && (
                                    <Line 
                                        yAxisId="temp"
                                        type="monotone"
                                        dataKey="Sensação Térmica"
                                        stroke="#50e3c2"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '50e3c2', r: 3 }}
                                    />
                                )}
                                <Line 
                                    yAxisId="humidity"
                                    type="monotone"
                                    dataKey="humidity"
                                    stroke="#097d77"
                                    strokeWidth={2}
                                    dot={{ fill: '#097d77', r: 4 }}
                                    name="Umidade (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-gray-900">
                            Nenhum dado disponível
                        </div>
                    )}
                </CardContent>
            </Card>
        );
};