import { useRealtimeWeather } from '@/hooks/useRealtimeWeather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Thermometer, Droplets, Wind, MapPin, Activity } from 'lucide-react'

export default function Realtime() {
  const { latestData, isConnected } = useRealtimeWeather()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tempo Real</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento climático em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-accent animate-pulse' : 'bg-destructive'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {!isConnected && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <p className="text-destructive text-center">
            Não foi possível conectar ao servidor de dados em tempo real.
            Verifique se o backend está rodando.
          </p>
        </Card>
      )}

      {isConnected && !latestData && (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Activity className="h-5 w-5 animate-pulse" />
            <p>Aguardando dados em tempo real...</p>
          </div>
        </Card>
      )}

      {latestData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {latestData.city}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date(latestData.timestamp).toLocaleString('pt-BR')}
              </p>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-warning/20 bg-gradient-to-br from-card to-warning/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Temperatura</CardTitle>
                <Thermometer className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-warning">
                {latestData.temperature.toFixed(1)}°C
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Umidade</CardTitle>
                <Droplets className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {latestData.humidity.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Vento</CardTitle>
                <Wind className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">
                {latestData.windSpeed.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">km/h</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
