import { Loader2, MapPin, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { City, State } from '@/services/location'

interface LocationSelectorProps {
  states: State[]
  cities: City[]
  selectedStateId: number | null
  selectedCity: City | null
  coordinates: { lat: number; lng: number } | null
  currentWeatherLocation?: string
  latestLocation?: string
  isLoadingStates: boolean
  isLoadingCities: boolean
  isLoading: boolean
  onStateChange: (stateId: string) => void
  onCityChange: (cityId: string) => void
  onRefresh: () => void
}

export function LocationSelector({
  states,
  cities,
  selectedStateId,
  selectedCity,
  coordinates,
  currentWeatherLocation,
  latestLocation,
  isLoadingStates,
  isLoadingCities,
  isLoading,
  onStateChange,
  onCityChange,
  onRefresh,
}: LocationSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          Selecionar Localização
        </CardTitle>
        <CardDescription>
          Dados de estados e municípios do IBGE, coordenadas do Open-Meteo Geocoding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select
              value={selectedStateId?.toString() || ''}
              onValueChange={onStateChange}
              disabled={isLoadingStates}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder={isLoadingStates ? 'Carregando...' : 'Selecione o estado'} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state: State) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.nome} ({state.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Select
              value={selectedCity?.id?.toString() || ''}
              onValueChange={onCityChange}
              disabled={!selectedStateId || isLoadingCities}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder={
                  !selectedStateId
                    ? 'Selecione um estado primeiro'
                    : isLoadingCities
                      ? 'Carregando cidades...'
                      : 'Selecione a cidade'
                } />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city: City) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={!coordinates || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Buscar Clima
          </Button>
        </div>
        {currentWeatherLocation && (
          <p className="mt-3 text-sm text-muted-foreground">
            Exibindo clima atual para: <strong>{currentWeatherLocation}</strong>
            {coordinates && (
              <span className="ml-2 text-xs">
                ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
              </span>
            )}
          </p>
        )}
        {!currentWeatherLocation && !selectedCity && latestLocation && (
          <p className="mt-3 text-sm text-muted-foreground">
            Exibindo dados do collector: <strong>{latestLocation}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
