import { CloudRain, Droplets, Thermometer, Wind } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrentWeather } from '@/services/weather'

interface WeatherCardsProps {
  weather: CurrentWeather | null
}

export function WeatherCards({ weather }: WeatherCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather?.temperature?.toFixed(1) || '--'}°C</div>
          <p className="text-xs text-muted-foreground">{weather?.condition || 'Sem dados'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Umidade</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather?.humidity?.toFixed(0) || '--'}%</div>
          <p className="text-xs text-muted-foreground">Umidade relativa do ar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Vento</CardTitle>
          <Wind className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather?.windSpeed?.toFixed(1) || '--'} km/h</div>
          <p className="text-xs text-muted-foreground">Velocidade do vento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Chuva</CardTitle>
          <CloudRain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather?.rainProbability?.toFixed(0) || '--'}%</div>
          <p className="text-xs text-muted-foreground">Probabilidade de precipitação</p>
        </CardContent>
      </Card>
    </div>
  )
}
