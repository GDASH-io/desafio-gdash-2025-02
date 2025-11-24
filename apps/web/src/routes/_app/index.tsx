import { WeatherLogType } from '@repo/shared'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Download, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { InsightsCard, LocationSelector, WeatherCards, WeatherCharts, WeatherTable } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { getUrlParam, updateUrl } from '@/hooks/useUrlParams'
import { api } from '@/lib/api'
import { City, fetchCitiesByState, fetchCityCoordinates, fetchStates, State } from '@/services/location'
import {
  collectWeather,
  CurrentWeather,
  fetchInsights,
  fetchLatestWeather,
  fetchWeatherByCoordinates,
  fetchWeatherLogs,
  generateInsights,
} from '@/services/weather'

export const Route = createFileRoute('/_app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const queryClient = useQueryClient()

  const [selectedStateId, setSelectedStateId] = useState<number | null>(() => getUrlParam('estado'))
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedCityIdFromUrl] = useState<number | null>(() => getUrlParam('cidade'))
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingCoords, setIsLoadingCoords] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)
  const [logsPage, setLogsPage] = useState(() => getUrlParam('page') ?? 1)
  const [logsLimit, setLogsLimit] = useState(() => getUrlParam('limit') ?? 10)

  const { data: states = [], isLoading: isLoadingStates } = useQuery({
    queryKey: ['ibge', 'states'],
    queryFn: fetchStates,
    staleTime: Infinity,
  })

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['ibge', 'cities', selectedStateId],
    queryFn: () => fetchCitiesByState(selectedStateId!),
    enabled: !!selectedStateId,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      const sp = states.find((s: State) => s.sigla === 'SP')
      if (sp) {
        setSelectedStateId(sp.id)
        updateUrl({ estado: sp.id })
      }
    }
  }, [states, selectedStateId])

  useEffect(() => {
    if (cities.length > 0 && selectedCityIdFromUrl && !selectedCity) {
      const city = cities.find((c: City) => c.id === selectedCityIdFromUrl)
      if (city) {
        handleCityChange(String(city.id))
      }
    }
  }, [cities, selectedCityIdFromUrl, selectedCity])

  const { data: currentWeather, refetch: refetchCurrentWeather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ['weather', 'current', coordinates?.lat, coordinates?.lng],
    queryFn: () => fetchWeatherByCoordinates(
      coordinates!.lat,
      coordinates!.lng,
      selectedCity ? `${selectedCity.nome}, ${states.find((s: State) => s.id === selectedStateId)?.sigla}` : ''
    ),
    enabled: !!coordinates,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 5 * 60 * 1000,
  })

  const locationName = selectedCity && selectedStateId
    ? `${selectedCity.nome}, ${states.find((s: State) => s.id === selectedStateId)?.sigla}`
    : undefined

  const { data: latest } = useQuery({
    queryKey: ['weather', 'latest', locationName],
    queryFn: () => fetchLatestWeather(locationName),
  })

  const { data: logsData } = useQuery({
    queryKey: ['weather', 'logs', locationName, logsPage, logsLimit],
    queryFn: () => fetchWeatherLogs(logsPage, logsLimit, locationName),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: insights, refetch: refetchInsights } = useQuery({
    queryKey: ['weather', 'insights'],
    queryFn: fetchInsights,
  })

  const handleStateChange = (stateId: string) => {
    const id = Number(stateId)
    setSelectedStateId(id)
    setSelectedCity(null)
    setCoordinates(null)
    updateUrl({ estado: id, cidade: undefined })
  }

  const handleCityChange = async (cityId: string) => {
    const city = cities.find((c: City) => c.id === Number(cityId))
    if (city) {
      setSelectedCity(city)
      setIsLoadingCoords(true)
      updateUrl({ cidade: city.id, page: 1 })

      try {
        const stateName = states.find((s: State) => s.id === selectedStateId)?.nome || ''
        const stateSigla = states.find((s: State) => s.id === selectedStateId)?.sigla || ''
        const geocoding = await fetchCityCoordinates(city.nome, stateName)
        if (geocoding) {
          setCoordinates({ lat: geocoding.latitude, lng: geocoding.longitude })

          const location = `${city.nome}, ${stateSigla}`
          setIsCollecting(true)
          try {
            await collectWeather(geocoding.latitude, geocoding.longitude, location)
            const [logs, latestData] = await Promise.all([
              fetchWeatherLogs(1, logsLimit, location),
              fetchLatestWeather(location),
            ])
            setLogsPage(1)
            queryClient.setQueryData(['weather', 'logs', location, 1, logsLimit], logs)
            queryClient.setQueryData(['weather', 'latest', location], latestData)
            toast.success('Dados coletados!')
          } catch {
            toast.error('Erro ao coletar dados')
          } finally {
            setIsCollecting(false)
          }
        } else {
          toast.error('Não foi possível encontrar as coordenadas da cidade')
        }
      } catch {
        toast.error('Erro ao buscar coordenadas')
      } finally {
        setIsLoadingCoords(false)
      }
    }
  }

  const handleRefresh = async () => {
    if (!coordinates || !locationName) {
      toast.error('Selecione uma cidade primeiro')
      return
    }

    setIsCollecting(true)
    try {
      await collectWeather(coordinates.lat, coordinates.lng, locationName)
      await queryClient.invalidateQueries({ queryKey: ['weather'] })
      toast.success('Dados atualizados!')
    } catch {
      toast.error('Erro ao coletar dados')
    } finally {
      setIsCollecting(false)
    }
  }

  const handleGenerateInsights = async () => {
    try {
      await generateInsights()
      refetchInsights()
      toast.success('Insights gerados com sucesso!')
    } catch {
      toast.error('Erro ao gerar insights')
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/weather/export/${format}`

    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `weather-logs.${format}`
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
      toast.success(`Exportado para ${format.toUpperCase()}!`)
    } catch {
      toast.error('Erro ao exportar')
    }
  }

  const handlePageChange = (newPage: number) => {
    setLogsPage(newPage)
    updateUrl({ page: newPage })
  }

  const handleLimitChange = (newLimit: number) => {
    setLogsLimit(newLimit)
    setLogsPage(1)
    updateUrl({ limit: newLimit, page: 1 })
  }

  const chartData =
    logsData?.items
      .slice()
      .reverse()
      .map((log: WeatherLogType) => ({
        time: new Date(log.collectedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temperature: log.temperature,
        humidity: log.humidity,
        rainProbability: log.rainProbability,
      })) || []

  const displayWeather: CurrentWeather | null = currentWeather || (latest ? {
    temperature: latest.temperature,
    humidity: latest.humidity,
    windSpeed: latest.windSpeed,
    condition: latest.condition,
    rainProbability: latest.rainProbability,
    location: latest.location,
  } : null)

  const isLoading = isLoadingCoords || isLoadingWeather

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isCollecting || !coordinates}>
            {isCollecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
            <Download className="mr-2 h-4 w-4" />
            XLSX
          </Button>
        </div>
      </div>

      <LocationSelector
        states={states}
        cities={cities}
        selectedStateId={selectedStateId}
        selectedCity={selectedCity}
        coordinates={coordinates}
        currentWeatherLocation={currentWeather?.location}
        latestLocation={latest?.location}
        isLoadingStates={isLoadingStates}
        isLoadingCities={isLoadingCities}
        isLoading={isLoading}
        onStateChange={handleStateChange}
        onCityChange={handleCityChange}
        onRefresh={() => refetchCurrentWeather()}
      />

      <WeatherCards weather={displayWeather} />

      <WeatherCharts data={chartData} />

      <InsightsCard insights={insights} onGenerateInsights={handleGenerateInsights} />

      <WeatherTable
        logs={logsData?.items || []}
        page={logsPage}
        totalPages={logsData?.meta.totalPages || 1}
        limit={logsLimit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}
