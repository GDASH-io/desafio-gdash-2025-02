import { Download, TrendingUp, Droplets, Wind, Thermometer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useWeatherData, useWeatherChartData, useWeatherInsights, useExportCSV, useExportXLSX } from '@/hooks/useWeather'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ReactMarkdown from 'react-markdown'

import { AnimatedNumber } from '@/components/ui/AnimatedNumber'


export const DashboardPage = () => {
    const { data: weatherData, isLoading: isLoadingWeather } = useWeatherData()
    const { data: chartData, isLoading: isLoadingChart } = useWeatherChartData()
    const { data: insights, isLoading: isLoadingInsights } = useWeatherInsights()
    const exportCSV = useExportCSV()
    const exportXLSX = useExportXLSX()
    const { toast } = useToast()

    const insightsMock = {
        "estatisticas": {
            "temperatura": {
                "media": 29.3,
                "max": 31.7,
                "min": 28.2
            },
            "umidade": {
                "media": 64.4,
                "max": 65,
                "min": 64
            },
            "vento": {
                "media": 10.02,
                "max": 14.6,
                "min": 2.3
            },
            "probabilidade_chuva": {
                "media": 0,
                "max": 0,
                "min": 0
            }
        },
        "conforto_climatico": 69,
        "resumo": "Clima quente e úmido com ventos variados de moderados a fracos e ausência de probabilidade de chuva.",
        "analise_tecnica": "A análise dos registros climáticos de Teresina revela uma tendência geral de clima quente e úmido, característica da região no período observado. A temperatura média de 29.3°C, com picos de 31.7°C, indica um ambiente termicamente desafiador. A umidade relativa do ar manteve-se consistentemente elevada, com média de 64.4% e pouca variação, contribuindo para uma sensação térmica de abafamento.\n\nEm relação às anomalias e padrões, observa-se uma clara tendência de elevação da temperatura ao longo do período de coleta, que abrange da madrugada ao meio da manhã (00:39 a 09:51), consistente com o ciclo diurno de aquecimento solar. A umidade, por outro lado, demonstrou notável estabilidade. Uma anomalia significativa reside na variação do regime de ventos: enquanto os primeiros registros indicavam ventos moderados (acima de 14 km/h), os dados posteriores exibem uma diminuição drástica, com valores mínimos de 2.3 km/h. Esta redução do fluxo de ar é crucial para a percepção de conforto térmico. A probabilidade de chuva manteve-se nula em todos os registros, indicando condições de tempo estável e sem precipitação durante o período analisado.\n\nA interpretação prática desses dados sugere que, apesar da ausência de chuva ser favorável a atividades externas, o elevado gradiente térmico e a umidade constante, combinados com a redução dos ventos, criam um ambiente propenso ao desconforto térmico. As primeiras horas da manhã com ventos mais fortes podem oferecer algum alívio, mas o avanço do dia traz temperaturas mais altas e ventos mais fracos, intensificando a sensação de calor.\n\nOs riscos e implicações incluem um risco aumentado de estresse térmico e desidratação para indivíduos expostos por períodos prolongados, especialmente durante atividades físicas. A diminuição acentuada do vento nos registros mais recentes é um fator de risco, pois reduz a capacidade de resfriamento por convecção e evaporação. Recomenda-se hidratação contínua, uso de roupas leves e busca por ambientes com sombra ou climatizados, além de evitar esforço físico intenso nas horas de maior calor e menor ventilação."

    }
    const normalizedInsights = Array.isArray(insights) ? insights[0] : insights;

    const handleExportCSV = async () => {
        try {
            await exportCSV.mutateAsync()
            toast({
                title: 'Sucesso!',
                description: 'Dados exportados para CSV',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Falha na exportação',
                description: 'Falha ao exportar dados',
            })
        }
    }

    const handleExportXLSX = async () => {
        try {
            await exportXLSX.mutateAsync()
            toast({
                title: 'Sucesso!',
                description: 'Dados exportados para Excel',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Falha na exportação',
                description: 'Falha ao exportar dados',
            })
        }
    }

    if (isLoadingWeather || isLoadingChart || isLoadingInsights) {
        return <LoadingSpinner size="lg" />
    }

    const latestWeather = weatherData?.[0]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-hand text-primary">Painel</h1>
                    <p className="text-muted-foreground mt-1">
                        Dados meteorológicos em tempo real com insights de IA
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={exportCSV.isPending}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportXLSX}
                        disabled={exportXLSX.isPending}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                        <Thermometer className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-hand">{latestWeather?.temperatura || 0}°C</div>
                        <p className="text-xs text-muted-foreground">Temperatura atual</p>
                    </CardContent>
                </Card>

                <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Umidade</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-hand">{latestWeather?.umidade || 0}%</div>
                        <p className="text-xs text-muted-foreground">Umidade relativa</p>
                    </CardContent>
                </Card>

                <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Velocidade do Vento</CardTitle>
                        <Wind className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-hand">{latestWeather?.vento || 0} km/h</div>
                        <p className="text-xs text-muted-foreground">Velocidade atual do vento</p>
                    </CardContent>
                </Card>

                <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Condição</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-hand">{latestWeather?.condicao || 'N/D'}</div>
                        <p className="text-xs text-muted-foreground">Condição climática</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="sketch-card">
                    <CardHeader>
                        <CardTitle className="font-hand">Temperatura ao Longo do Tempo</CardTitle>
                        <CardDescription>Dados históricos de temperatura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="temperatura"
                                    stroke="#1DB954"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="sketch-card">
                    <CardHeader>
                        <CardTitle className="font-hand">Probabilidade de Chuva</CardTitle>
                        <CardDescription>Previsão de probabilidade de chuva</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="probabilidade_chuva"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card className="sketch-card">
                <CardHeader>
                    <CardTitle className="font-hand">Insights de IA sobre o Clima</CardTitle>
                    <CardDescription>Análise inteligente de padrões climáticos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {isLoadingInsights ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                                <span className="text-muted-foreground text-sm mt-2">Carregando insights de IA...</span>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-medium font-hand">Resumo</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {normalizedInsights?.resumo || insightsMock.resumo}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium font-hand">Estatísticas</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                        <li>Temperatura Média: {normalizedInsights?.estatisticas?.temperatura?.media}°C</li>
                                        <li>Umidade Média: {normalizedInsights?.estatisticas?.umidade?.media}%</li>
                                        <li>Velocidade Média do Vento: {normalizedInsights?.estatisticas?.vento?.media} km/h</li>
                                        <li>Probabilidade Média de Chuva: {normalizedInsights?.estatisticas?.probabilidade_chuva?.media}%</li>
                                        <li>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm text-primary">Índice de Conforto Climático</span>
                                                    <span className="relative group cursor-pointer" tabIndex={0} aria-label="Ajuda sobre conforto climático">
                                                        <span className={`inline-block w-9 text-center font-bold text-base rounded transition-colors duration-300 ${(normalizedInsights?.conforto_climatico) < 40
                                                                ? 'bg-red-100 text-red-700 border border-red-300'
                                                                : (normalizedInsights?.conforto_climatico) < 70
                                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                                    : 'bg-green-100 text-green-700 border border-green-300'
                                                            }`}>
                                                            <AnimatedNumber value={normalizedInsights?.conforto_climatico} />
                                                        </span>
                                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block group-focus:block bg-background text-xs text-muted-foreground px-2 py-1 rounded shadow z-10 border border-border whitespace-nowrap">
                                                            Quanto maior, mais confortável o clima
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="relative w-full h-2 bg-muted rounded overflow-hidden border border-border mt-1">
                                                    <div
                                                        className={`absolute left-0 top-0 h-2 transition-all duration-300 rounded ${(normalizedInsights?.conforto_climatico) < 40
                                                                ? 'bg-red-500'
                                                                : (normalizedInsights?.conforto_climatico) < 70
                                                                    ? 'bg-yellow-400'
                                                                    : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${normalizedInsights?.conforto_climatico}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                                    <span>Desconfortável</span>
                                                    <span>Confortável</span>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium font-hand">Análise Técnica</h3>
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                                            <ReactMarkdown>
                                                {normalizedInsights?.analise_tecnica}
                                            </ReactMarkdown>
                                    </p>
                                </div>
                            </>
                        )}

                    </div>
                </CardContent>
            </Card>
            <Card className="sketch-card">
                <CardHeader>
                    <CardTitle className="font-hand">Registros Meteorológicos</CardTitle>
                    <CardDescription>Entradas de dados meteorológicos recentes</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Localização</TableHead>
                                <TableHead>Condição</TableHead>
                                <TableHead>Temperatura</TableHead>
                                <TableHead>Umidade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weatherData?.slice(0, 10).map((record) => (
                                <TableRow key={record._id}>
                                    <TableCell>{formatDate(record.data_coleta)}</TableCell>
                                    <TableCell className="font-medium">{record.cidade}</TableCell>
                                    <TableCell>{record.condicao}</TableCell>
                                    <TableCell>{record.temperatura}°C</TableCell>
                                    <TableCell>{record.umidade}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
