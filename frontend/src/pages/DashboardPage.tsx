import { Download, TrendingUp, Droplets, Wind, Thermometer, AlertCircle } from 'lucide-react'
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

export const DashboardPage = () => {
    const { data: weatherData, isLoading: isLoadingWeather } = useWeatherData()
    const { data: chartData, isLoading: isLoadingChart } = useWeatherChartData()
    const { data: insights, isLoading: isLoadingInsights } = useWeatherInsights()
    const exportCSV = useExportCSV()
    const exportXLSX = useExportXLSX()
    const { toast } = useToast()

    const insightsMock = [
        { id: '1', type: 'alert', message: 'Alta chance de chuva nas próximas 24 horas.', createdAt: new Date()
        },
        { id: '2', type: 'warning', message: 'Tendência de queda na temperatura nos próximos dias.', createdAt: new Date()
        },
        { id: '3', type: 'success', message: 'Período agradável esperado para o final de semana.', createdAt: new Date()
        },
    ]
    // apenas para debug
    console.log(insights)
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

            {/* Charts */}
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

            {/*
            {insights && insights.length > 0 && (
                <Card className="sketch-card">
                    <CardHeader>
                        <CardTitle className="font-hand">Insights de IA sobre o Clima</CardTitle>
                        <CardDescription>Análise inteligente de padrões climáticos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {insights.map((insight) => (
                                <div
                                    key={insight.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 ${insight.type === 'alert'
                                        ? 'bg-destructive/10 border-destructive'
                                        : insight.type === 'warning'
                                            ? 'bg-orange-500/10 border-orange-500'
                                            : insight.type === 'success'
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-muted border-muted-foreground'
                                        }`}
                                >
                                    <AlertCircle className="h-5 w-5 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium">{insight.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(insight.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
*/}
            <Card className="sketch-card">
                <CardHeader>
                    <CardTitle className="font-hand">Insights de IA sobre o Clima</CardTitle>
                    <CardDescription>Análise inteligente de padrões climáticos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {insightsMock.map((insight) => (
                            <div
                                key={insight.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 ${insight.type === 'alert'
                                    ? 'bg-destructive/10 border-destructive'
                                    : insight.type === 'warning'
                                        ? 'bg-orange-500/10 border-orange-500'
                                        : insight.type === 'success'
                                            ? 'bg-primary/10 border-primary'
                                            : 'bg-muted border-muted-foreground'
                                    }`}
                            >
                                <AlertCircle className="h-5 w-5 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">{insight.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(insight.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
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
