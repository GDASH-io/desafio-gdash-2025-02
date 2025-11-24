import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Gauge,
  CloudRain,
  Eye,
  ArrowUp,
  MapPin
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Dados mockados para demonstração
const currentWeather = {
  temperature: 24.5,
  feelsLike: 26.2,
  humidity: 68,
  windSpeed: 12.5,
  uvIndex: 6,
  pressure: 1013,
  visibility: 10,
  precipitation: 15,
  city: 'São Paulo',
  state: 'SP',
  lastUpdate: '2025-11-23T14:30:00',
};

const temperatureData = [
  { time: '00:00', temp: 18, humidity: 75 },
  { time: '03:00', temp: 17, humidity: 78 },
  { time: '06:00', temp: 16, humidity: 82 },
  { time: '09:00', temp: 20, humidity: 70 },
  { time: '12:00', temp: 23, humidity: 65 },
  { time: '15:00', temp: 25, humidity: 62 },
  { time: '18:00', temp: 22, humidity: 68 },
  { time: '21:00', temp: 20, humidity: 72 },
];

const recentLogs = [
  { id: 1, time: '14:30', temp: 24.5, humidity: 68, wind: 12.5, condition: 'Parcialmente Nublado' },
  { id: 2, time: '14:00', temp: 24.2, humidity: 67, wind: 11.8, condition: 'Parcialmente Nublado' },
  { id: 3, time: '13:30', temp: 23.8, humidity: 69, wind: 12.1, condition: 'Nublado' },
  { id: 4, time: '13:00', temp: 23.5, humidity: 70, wind: 11.5, condition: 'Nublado' },
  { id: 5, time: '12:30', temp: 23.0, humidity: 72, wind: 10.9, condition: 'Nublado' },
];

export function Dashboard() {
  const { user } = useAuth();
  const [selectedCity] = useState('São Paulo - SP');

  const getUVLevel = (index: number) => {
    if (index <= 2) return { label: 'Baixo', variant: 'secondary' as const };
    if (index <= 5) return { label: 'Moderado', variant: 'default' as const };
    if (index <= 7) return { label: 'Alto', variant: 'destructive' as const };
    return { label: 'Muito Alto', variant: 'destructive' as const };
  };

  const uvLevel = getUVLevel(currentWeather.uvIndex);

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo, {user?.name}! Acompanhe os dados climáticos em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <MapPin className="h-4 w-4" />
            <span>{selectedCity}</span>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Temperatura"
            value={currentWeather.temperature}
            unit="°C"
            icon={Thermometer}
            description="Sensação térmica: 26.2°C"
            trend="up"
          />
          <MetricCard
            title="Umidade"
            value={currentWeather.humidity}
            unit="%"
            icon={Droplets}
            description="Nível confortável"
            trend="neutral"
          />
          <MetricCard
            title="Vento"
            value={currentWeather.windSpeed}
            unit="km/h"
            icon={Wind}
            description="Brisa moderada"
            trend="neutral"
          />
          <MetricCard
            title="Índice UV"
            value={currentWeather.uvIndex}
            unit=""
            icon={Sun}
            description={uvLevel.label}
            trend="up"
          />
        </div>

        {/* Métricas secundárias */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Pressão"
            value={currentWeather.pressure}
            unit="hPa"
            icon={Gauge}
            description="Normal"
          />
          <MetricCard
            title="Visibilidade"
            value={currentWeather.visibility}
            unit="km"
            icon={Eye}
            description="Ótima visibilidade"
          />
          <MetricCard
            title="Precipitação"
            value={currentWeather.precipitation}
            unit="%"
            icon={CloudRain}
            description="Chance baixa de chuva"
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Temperatura */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Temperatura nas últimas 24h</CardTitle>
              <CardDescription>Variação da temperatura ao longo do dia</CardDescription>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

          {/* Gráfico de Umidade */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Umidade nas últimas 24h</CardTitle>
              <CardDescription>Variação da umidade relativa do ar</CardDescription>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Umidade (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

        {/* Tabela de logs recentes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
            <CardDescription>
              Últimas leituras de dados climáticos
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Umidade</TableHead>
                <TableHead>Vento</TableHead>
                <TableHead>Condição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      {log.temp}°C
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      {log.humidity}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-gray-500" />
                      {log.wind} km/h
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.condition}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        {/* Card de AI Insights - Placeholder */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Análises inteligentes sobre os dados climáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Seção de insights com IA em construção... 🤖
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
