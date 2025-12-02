import { useQuery } from '@tanstack/react-query'
import { weatherApi, type WeatherData } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Thermometer, Droplets, Wind, MapPin, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Weather() {
  const { data: weatherData, isLoading, error } = useQuery<WeatherData[]>({
    queryKey: ['weatherHistory'],
    queryFn: async () => (await weatherApi.getAll()) ?? [],
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados Climáticos</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de medições climáticas
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados Climáticos</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de medições climáticas
          </p>
        </div>
        <Card className="p-6">
          <p className="text-destructive">
            Erro ao carregar dados climáticos. Verifique se o backend está rodando.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados Climáticos</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de {weatherData?.length || 0} medições climáticas
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weatherData?.map((data) => (
          <Card key={data.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {data.city}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(data.timestamp).toLocaleString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Temperatura:</span>
                <span className="text-sm ml-auto">{data.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Umidade:</span>
                <span className="text-sm ml-auto">{data.humidity.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Vento:</span>
                <span className="text-sm ml-auto">{data.windSpeed.toFixed(1)} km/h</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!weatherData || weatherData.length === 0) && (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Nenhum dado climático disponível no momento.
          </p>
        </Card>
      )}
    </div>
  )
}
