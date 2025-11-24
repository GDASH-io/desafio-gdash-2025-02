import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Gauge,
  CloudRain,
  Eye,
  Sparkles,
  MapPin,
  Loader2,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [selectedCity] = useState('São Paulo - SP');
  const [insightContext, setInsightContext] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);

  const getUVLevel = (index: number) => {
    if (index <= 2) return { label: 'Baixo', variant: 'secondary' as const };
    if (index <= 5) return { label: 'Moderado', variant: 'default' as const };
    if (index <= 7) return { label: 'Alto', variant: 'destructive' as const };
    return { label: 'Muito Alto', variant: 'destructive' as const };
  };

  const uvLevel = getUVLevel(currentWeather.uvIndex);

  const handleGenerateInsight = () => {
    setIsGenerating(true);
    
    // Simular chamada à API com dados mockados
    setTimeout(() => {
      const mockInsights = {
        general: `Com base nos dados climáticos de São Paulo, observamos uma temperatura de 24.5°C com sensação térmica de 26.2°C. A umidade relativa está em 68%, dentro da faixa de conforto. O índice UV está em 6 (Alto), recomenda-se uso de protetor solar. As condições atuais indicam tempo parcialmente nublado com baixa probabilidade de precipitação (15%). A pressão atmosférica está estável em 1013 hPa, indicando manutenção do padrão climático atual.`,
        
        alerts: `⚠️ ALERTAS IMPORTANTES:\n\n1. ÍNDICE UV ALTO (6): Recomenda-se evitar exposição solar prolongada entre 10h e 16h. Use protetor solar FPS 30+, chapéu e óculos de sol.\n\n2. UMIDADE EM ELEVAÇÃO: A umidade subiu de 62% para 68% nas últimas 3 horas. Pessoas com problemas respiratórios devem ficar atentas.\n\n3. VENTOS MODERADOS: Rajadas de até 12.5 km/h podem causar desconforto em áreas abertas.`,
        
        recommendations: `📋 RECOMENDAÇÕES PARA AS PRÓXIMAS HORAS:\n\n🌡️ TEMPERATURA: Esperada elevação para 26°C até às 15h. Mantenha-se hidratado e use roupas leves.\n\n💧 HIDRATAÇÃO: Com a temperatura atual e umidade, recomenda-se ingestão de pelo menos 2L de água.\n\n🏃 ATIVIDADES FÍSICAS: Melhor período para exercícios ao ar livre: antes das 9h ou após as 17h, quando o índice UV estará mais baixo.\n\n🌤️ CONFORTO TÉRMICO: Ambiente climatizado entre 22-24°C é ideal para o período.\n\n☔ CHUVA: Probabilidade baixa (15%) nas próximas 6 horas. Sem necessidade de guarda-chuva.`,
        
        trends: `📊 ANÁLISE DE TENDÊNCIAS (Últimas 24h):\n\n📈 TEMPERATURA: Padrão típico observado com mínima de 16°C (06h) e máxima prevista de 25°C (15h). Amplitude térmica de 9°C.\n\n💧 UMIDADE: Comportamento inverso à temperatura, com pico de 82% durante a madrugada e mínimo de 62% à tarde. Atualmente em fase de estabilização.\n\n🌪️ VENTO: Rajadas constantes entre 10-13 km/h, vindas de sudeste. Padrão estável sem previsão de mudanças significativas.\n\n🔄 PADRÃO GERAL: Condições típicas de outono para São Paulo, com estabilidade atmosférica. Próximas 48h devem manter padrão similar.`
      };

      setGeneratedInsight(mockInsights[insightContext as keyof typeof mockInsights]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleExportCSV = () => {
    // Simula exportação CSV (futura integração com backend)
    toast({
      title: 'Exportando CSV',
      description: 'O download será iniciado em breve...',
    });
    setTimeout(() => {
      toast({
        variant: 'success',
        title: 'CSV exportado',
        description: 'Dados climáticos exportados com sucesso!',
      });
    }, 1500);
  };

  const handleExportXLSX = () => {
    // Simula exportação XLSX (futura integração com backend)
    toast({
      title: 'Exportando XLSX',
      description: 'O download será iniciado em breve...',
    });
    setTimeout(() => {
      toast({
        variant: 'success',
        title: 'XLSX exportado',
        description: 'Dados climáticos exportados com sucesso!',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo, {user?.name}! Acompanhe os dados climáticos em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <MapPin className="h-4 w-4" />
              <span>{selectedCity}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXLSX}>
              <FileDown className="mr-2 h-4 w-4" />
              XLSX
            </Button>
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
          <Card className="shadow-sm bg-white">
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
          <Card className="shadow-sm bg-white">
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
        <Card className="shadow-sm bg-white">
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

        {/* Card de AI Insights */}
        <Card className="shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Análises inteligentes sobre os dados climáticos usando IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Análise
                </label>
                <Select value={insightContext} onValueChange={setInsightContext}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contexto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Análise Geral</SelectItem>
                    <SelectItem value="alerts">Alertas Importantes</SelectItem>
                    <SelectItem value="recommendations">Recomendações</SelectItem>
                    <SelectItem value="trends">Análise de Tendências</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateInsight}
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Insight
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Área de exibição do insight */}
            {generatedInsight ? (
              <div className="rounded-lg border p-6" style={{ background: 'linear-gradient(to bottom right, rgb(250 245 255), rgb(239 246 255))' }}>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-1">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-3 text-purple-900">
                      {insightContext === 'general' && 'Análise Geral do Clima'}
                      {insightContext === 'alerts' && 'Alertas Importantes'}
                      {insightContext === 'recommendations' && 'Recomendações Personalizadas'}
                      {insightContext === 'trends' && 'Análise de Tendências'}
                    </h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {generatedInsight}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200 flex items-center gap-2 text-xs text-purple-600">
                      <Sparkles className="h-3 w-3" />
                      <span>Gerado por IA • {new Date().toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecione um tipo de análise e clique em "Gerar Insight" para obter análises inteligentes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
