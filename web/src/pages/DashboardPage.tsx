import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../services/api'
import { LocationSettings } from '../components/LocationSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

// Constantes de configuração
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutos
const MAX_HISTORICAL_RECORDS = 10
const AUTO_LOGIN_CREDENTIALS = {
  email: 'admin@gdash.com',
  password: 'admin123'
}

// Ícones profissionais com SVG melhorados
const ThermometerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Thermometer body */}
    <rect x="10" y="4" width="4" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Thermometer bulb */}
    <circle cx="12" cy="18" r="3" fill="currentColor" />
    {/* Temperature marks */}
    <line x1="14" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1" />
    <line x1="14" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1" />
    <line x1="14" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1" />
    <line x1="14" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1" />
    <line x1="14" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1" />
    {/* Temperature fluid */}
    <rect x="10.5" y="10" width="3" height="6" fill="#ef4444" rx="1" />
  </svg>
)
const DropletsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
)
const WindIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
  </svg>
)
const GaugeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 12l4-4 4 4" />
  </svg>
)
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)
const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)
const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const TrendingDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)
const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

interface WeatherData {
  _id: string
  city: string
  country: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  description: string
  pressure?: number
  visibility?: number
  cloudiness: number
  timestamp: string
}

interface LocationData {
  city: string
  state: string
  country: string
  countryCode: string
}

interface Prediction {
  timeframe: string
  description: string
  confidence: number
}

interface AnalysisItem {
  category: string
  description: string
  impact: string
}

interface DataQuality {
  score: number
  factors: string[]
  reliability: string
  quality: string
  message: string
}

interface HistoricalComparison {
  vs24h: {
    temperature: number
    humidity: number
  }
  vs7d: {
    temperature: number
    humidity: number
  } | null
}

interface Insights {
  summary: string
  detailedSummary: string
  comfortScore: number
  comfortLevel: string
  comfortDescription: string
  comfortFactors: string[]
  alerts: Array<{ type: string; message: string }>
  recommendations: string[]
  predictions: Prediction[]
  detailedAnalysis: AnalysisItem[]
  activityRecommendations: string[]
  historicalComparison: HistoricalComparison
  dataQuality: DataQuality
  trends: {
    temperature: 'rising' | 'falling' | 'stable'
    humidity: 'rising' | 'falling' | 'stable'
    windSpeed: 'rising' | 'falling' | 'stable'
    pressure: 'rising' | 'falling' | 'stable'
    trendStrength: number
  }
  statistics: {
    last24Hours: {
      count: number
      temperature?: { avg: number; min: number; max: number }
      humidity?: { avg: number; min: number; max: number }
      windSpeed?: { avg: number; min: number; max: number }
    }
    last7Days: {
      count: number
      temperature?: { avg: number; min: number; max: number }
      humidity?: { avg: number; min: number; max: number }
      windSpeed?: { avg: number; min: number; max: number }
    }
  }
  lastUpdated: string
}

export const DashboardPage = React.memo(() => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isDetectingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)

  const authenticateUser = useCallback(async (): Promise<boolean> => {
    try {
      const loginResponse = await api.post('/api/auth/login', AUTO_LOGIN_CREDENTIALS)
      const token = loginResponse.data.access_token
      if (token) {
        localStorage.setItem('authToken', token)
        return true
      }
    } catch (error) {
      console.error('Auto login failed:', error)
    }
    return false
  }, [])

  const fetchWeatherData = useCallback(async (): Promise<{weatherData: WeatherData[], insights: Insights} | null> => {
    const [weatherResponse, insightsResponse] = await Promise.all([
      api.get('/api/weather/recent?hours=24'),
      api.get('/api/weather/insights')
    ])
    return {
      weatherData: weatherResponse.data,
      insights: insightsResponse.data
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!currentLocation) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Verificar autenticação
      let token = localStorage.getItem('authToken')
      if (!token) {
        const authenticated = await authenticateUser()
        if (!authenticated) {
          setError('Erro de autenticação. Faça login novamente.')
          return
        }
      }

      const data = await fetchWeatherData()
      if (data) {
        setWeatherData(data.weatherData)
        setInsights(data.insights)
        setLastUpdate(new Date())
      }
    } catch (err: any) {
      // Se erro 401, tentar login novamente
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken')
        const authenticated = await authenticateUser()
        if (authenticated) {
          try {
            const data = await fetchWeatherData()
            if (data) {
              setWeatherData(data.weatherData)
              setInsights(data.insights)
              setLastUpdate(new Date())
            }
          } catch (retryError) {
            setError('Erro ao carregar dados climáticos')
            console.error('Retry error:', retryError)
          }
        } else {
          setError('Erro de autenticação')
        }
      } else {
        setError('Erro ao carregar dados climáticos')
        console.error('Error fetching data:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentLocation, authenticateUser, fetchWeatherData])

  const initializeLocation = useCallback(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation')
      if (savedLocation) {
        const location = JSON.parse(savedLocation)
        setCurrentLocation(location)
      }
    } catch (error) {
      console.error('Error loading saved location:', error)
      setCurrentLocation(null)
    }
  }, [])

  // Carregar localização salva na inicialização
  useEffect(() => {
    initializeLocation()
  }, [initializeLocation])

  useEffect(() => {
    if (currentLocation) {
      fetchData()
    }
    
    // Auto-refresh when location is set
    let interval: number | null = null
    if (currentLocation) {
      interval = window.setInterval(fetchData, REFRESH_INTERVAL)
    }
    
    // Listener para refresh manual
    const handleRefresh = () => {
      fetchData()
    }
    window.addEventListener('refreshWeatherData', handleRefresh)
    
    return () => {
      if (interval) window.clearInterval(interval)
      window.removeEventListener('refreshWeatherData', handleRefresh)
    }
  }, [currentLocation, fetchData])

  const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/api/weather/export/${format}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `weather-data.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }, [])

  const handleLocationUpdate = useCallback((newLocation: LocationData) => {
    setCurrentLocation(newLocation)
    localStorage.setItem('userLocation', JSON.stringify(newLocation))
    
    // Recarregar dados após mudança de localização com delay para garantir que o backend processou
    setTimeout(() => {
      fetchData()
    }, 2000)
  }, [fetchData])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <TrendingUpIcon />
            <span>Subindo</span>
          </span>
        )
      case 'falling':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <TrendingDownIcon />
            <span>Descendo</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <MinusIcon />
            <span>Estável</span>
          </span>
        )
    }
  }



  const latestData = useMemo(() => weatherData[0], [weatherData])
  const displayWeatherData = useMemo(() => 
    weatherData.slice(0, MAX_HISTORICAL_RECORDS), 
    [weatherData]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  GDASH Weather
                </h1>
                <p className="text-lg text-slate-600 font-medium">Sistema Inteligente de Monitoramento Climático</p>
              </div>
            </div>
            
            {isDetectingLocation ? (
              <Card className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <div>
                      <p className="text-blue-800 font-semibold">Detectando localização</p>
                      <p className="text-blue-600 text-sm">Aguarde enquanto identificamos sua posição...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : currentLocation ? (
              <Card className="border-emerald-200 bg-emerald-50/50 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-800 font-semibold">
                        {currentLocation.city}, {currentLocation.state} - {currentLocation.country}
                      </p>
                      <p className="text-emerald-700 text-sm">
                        Dados atualizados automaticamente • Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-200 bg-amber-50/50 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertIcon />
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-800 font-semibold">Localização não configurada</p>
                      <p className="text-amber-700 text-sm">
                        Configure sua localização para começar o monitoramento climático
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                Sistema Online
              </Badge>

            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <LocationSettings onLocationUpdate={handleLocationUpdate} />
            
            <Button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              size="sm"
            >
              <RefreshIcon />
              <span className="ml-2">Atualizar</span>
            </Button>
            
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              size="sm"
            >
              <DownloadIcon />
              <span className="ml-2">CSV</span>
            </Button>
            
            <Button
              onClick={() => handleExport('xlsx')}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              size="sm"
            >
              <DownloadIcon />
              <span className="ml-2">Excel</span>
            </Button>
          </div>
        </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

        {!currentLocation ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full blur-xl"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Bem-vindo ao GDASH Weather
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                      Sistema inteligente de monitoramento climático com análises de IA
                    </p>
                    <p className="text-gray-500">
                      Configure sua localização para começar a receber dados meteorológicos em tempo real
                    </p>
                  </div>
                  
                  <div className="py-4">
                    <LocationSettings onLocationUpdate={handleLocationUpdate} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Dados em Tempo Real</p>
                        <p className="text-gray-500 text-xs">Atualizações a cada 5 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Análises de IA</p>
                        <p className="text-gray-500 text-xs">Insights inteligentes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DownloadIcon />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Exportação</p>
                        <p className="text-gray-500 text-xs">CSV e Excel disponíveis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status da Localização Configurada */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌍</div>
              <div>
                <p className="text-blue-800 font-medium">
                  📍 Coletando dados para: {currentLocation.city}, {currentLocation.state} - {currentLocation.country}
                </p>
                <p className="text-blue-600 text-sm">
                  {latestData ? 'Dados atualizados em tempo real a cada 5 minutos' : 'Aguardando primeira coleta de dados...'}
                </p>
              </div>
            </div>
          </div>

        {/* Current Weather Cards */}
        {latestData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-orange-100 text-sm font-medium">Temperatura</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{latestData.temperature}</span>
                      <span className="text-xl font-medium">°C</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {latestData.condition}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <ThermometerIcon />
                  </div>
                </div>
                {insights?.trends && (
                  <div className="flex items-center gap-2 mt-4 text-orange-100">
                    {getTrendIcon(insights.trends.temperature)}
                    <span className="text-xs font-medium">Tendência</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-blue-100 text-sm font-medium">Umidade</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{latestData.humidity}</span>
                      <span className="text-xl font-medium">%</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {latestData.humidity > 60 ? 'Alta' : latestData.humidity < 40 ? 'Baixa' : 'Ideal'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <DropletsIcon />
                  </div>
                </div>
                {insights?.trends && (
                  <div className="flex items-center gap-2 mt-4 text-blue-100">
                    {getTrendIcon(insights.trends.humidity)}
                    <span className="text-xs font-medium">Tendência</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-slate-100 text-sm font-medium">Vento</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{latestData.windSpeed}</span>
                      <span className="text-sm font-medium">km/h</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {latestData.windSpeed > 25 ? 'Forte' : latestData.windSpeed > 15 ? 'Moderado' : 'Calmo'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <WindIcon />
                  </div>
                </div>
              </CardContent>
            </Card>

            {insights && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-emerald-100 text-sm font-medium">Conforto</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{insights.comfortScore}</span>
                        <span className="text-xl font-medium">/100</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                        {insights.comfortLevel}
                      </Badge>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <GaugeIcon />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Temperatura', color: 'from-orange-500 to-red-500', icon: <ThermometerIcon /> },
              { title: 'Umidade', color: 'from-blue-500 to-cyan-500', icon: <DropletsIcon /> },
              { title: 'Vento', color: 'from-slate-600 to-slate-700', icon: <WindIcon /> },
              { title: 'Conforto', color: 'from-emerald-500 to-green-500', icon: <GaugeIcon /> }
            ].map((item, index) => (
              <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br ${item.color} text-white overflow-hidden relative animate-pulse`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <p className="text-white/80 text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/30 rounded-full animate-spin border-2 border-white/20 border-t-white"></div>
                        <span className="text-lg font-medium text-white/80">Coletando...</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl opacity-60">
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Insights Section */}
        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary and Alerts */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Insights de IA</CardTitle>
                    <CardDescription>Análise inteligente dos dados climáticos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Resumo Inteligente
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{insights.summary}</p>
                    {insights.detailedSummary && (
                      <p className="text-xs text-blue-600 italic">{insights.detailedSummary}</p>
                    )}
                    {insights.dataQuality && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-blue-200">
                        <div className={`w-2 h-2 rounded-full ${
                          insights.dataQuality.reliability === 'high' ? 'bg-green-500' :
                          insights.dataQuality.reliability === 'medium' ? 'bg-yellow-500' :
                          insights.dataQuality.reliability === 'low' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs text-blue-700">Qualidade: {insights.dataQuality.reliability} (Score: {insights.dataQuality.score})</span>
                      </div>
                    )}
                  </div>
                </div>

                {insights.alerts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Alertas do Sistema
                    </h4>
                    <div className="space-y-2">
                      {insights.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${
                            alert.type === 'danger' 
                              ? 'bg-red-50 text-red-800 border-red-200' 
                              : alert.type === 'warning' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : alert.type === 'caution'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <div className="mt-0.5">
                            <AlertIcon />
                          </div>
                          <span className="text-sm font-medium">{alert.message}</span>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}

                {insights.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Recomendações
                    </h4>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Enhanced insights sections */}
                {insights.predictions && insights.predictions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Previsões Inteligentes
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                      <ul className="space-y-2">
                        {insights.predictions.map((prediction: any, index: number) => (
                          <li key={index} className="text-sm text-purple-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{typeof prediction === 'string' ? prediction : prediction.description || 'Previsão disponível'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {insights.detailedAnalysis && insights.detailedAnalysis.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Análise Detalhada
                    </h4>
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                      <ul className="space-y-2">
                        {insights.detailedAnalysis.map((analysis: any, index: number) => (
                          <li key={index} className="text-sm text-indigo-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{typeof analysis === 'string' ? analysis : analysis.description || 'Análise disponível'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {insights.activityRecommendations && insights.activityRecommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Atividades Sugeridas
                    </h4>
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                      <ul className="space-y-2">
                        {insights.activityRecommendations.map((activity, index) => (
                          <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {insights.historicalComparison && (insights.historicalComparison.vs24h || insights.historicalComparison.vs7d) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      Comparação Histórica
                    </h4>
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.historicalComparison.vs24h && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <h5 className="text-xs font-semibold text-slate-600 mb-2">vs. 24h atrás</h5>
                            <div className="space-y-1 text-xs">
                              <div className={`flex justify-between ${insights.historicalComparison.vs24h.temperature > 0 ? 'text-red-600' : insights.historicalComparison.vs24h.temperature < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                <span>Temp:</span>
                                <span className="font-medium">{insights.historicalComparison.vs24h.temperature > 0 ? '+' : ''}{insights.historicalComparison.vs24h.temperature.toFixed(1)}°C</span>
                              </div>
                              <div className={`flex justify-between ${insights.historicalComparison.vs24h.humidity > 0 ? 'text-blue-600' : insights.historicalComparison.vs24h.humidity < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                <span>Umidade:</span>
                                <span className="font-medium">{insights.historicalComparison.vs24h.humidity > 0 ? '+' : ''}{insights.historicalComparison.vs24h.humidity.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {insights.historicalComparison.vs7d && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <h5 className="text-xs font-semibold text-slate-600 mb-2">vs. 7 dias atrás</h5>
                            <div className="space-y-1 text-xs">
                              <div className={`flex justify-between ${insights.historicalComparison.vs7d.temperature > 0 ? 'text-red-600' : insights.historicalComparison.vs7d.temperature < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                <span>Temp:</span>
                                <span className="font-medium">{insights.historicalComparison.vs7d.temperature > 0 ? '+' : ''}{insights.historicalComparison.vs7d.temperature.toFixed(1)}°C</span>
                              </div>
                              <div className={`flex justify-between ${insights.historicalComparison.vs7d.humidity > 0 ? 'text-blue-600' : insights.historicalComparison.vs7d.humidity < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                <span>Umidade:</span>
                                <span className="font-medium">{insights.historicalComparison.vs7d.humidity > 0 ? '+' : ''}{insights.historicalComparison.vs7d.humidity.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Estatísticas 24h</CardTitle>
                    <CardDescription>{insights.statistics.last24Hours.count} leituras registradas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {insights.statistics.last24Hours.temperature && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <ThermometerIcon />
                        Análise de Temperatura
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-600 font-medium mb-1">Média</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {insights.statistics.last24Hours.temperature.avg.toFixed(1)}<span className="text-sm">°C</span>
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">Mínima</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {insights.statistics.last24Hours.temperature.min.toFixed(1)}<span className="text-sm">°C</span>
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                          <p className="text-xs text-red-600 font-medium mb-1">Máxima</p>
                          <p className="text-2xl font-bold text-red-700">
                            {insights.statistics.last24Hours.temperature.max.toFixed(1)}<span className="text-sm">°C</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {insights.statistics.last24Hours.humidity && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <DropletsIcon />
                          Análise de Umidade
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-600 font-medium mb-1">Média</p>
                            <p className="text-2xl font-bold text-gray-800">
                              {insights.statistics.last24Hours.humidity.avg.toFixed(1)}<span className="text-sm">%</span>
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-1">Mínima</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {insights.statistics.last24Hours.humidity.min}<span className="text-sm">%</span>
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                            <p className="text-xs text-indigo-600 font-medium mb-1">Máxima</p>
                            <p className="text-2xl font-bold text-indigo-700">
                              {insights.statistics.last24Hours.humidity.max}<span className="text-sm">%</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Data Table */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Histórico de Dados</CardTitle>
                  <CardDescription>Registros meteorológicos mais recentes</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                {weatherData.length} registros
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Local</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Condição</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Temperatura</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Umidade</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Vento</th>
                  </tr>
                </thead>
                <tbody>
                  {displayWeatherData.length > 0 ? (
                    displayWeatherData.map((data, index) => (
                      <tr key={data._id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index === 0 ? 'bg-blue-50/30' : ''}`}>
                        <td className="py-3 px-2 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span className="font-medium">{new Date(data.timestamp).toLocaleDateString('pt-BR')}</span>
                            <span className="text-xs text-gray-500">{new Date(data.timestamp).toLocaleTimeString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{data.city}, {data.country}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {data.description}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm font-semibold">
                          <span className={`${data.temperature > 30 ? 'text-red-600' : data.temperature < 15 ? 'text-blue-600' : 'text-gray-800'}`}>
                            {data.temperature}°C
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700">{data.humidity}%</td>
                        <td className="py-3 px-2 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <WindIcon />
                            <span>{data.windSpeed} km/h</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : currentLocation ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-spin border-4 border-blue-100 border-t-transparent"></div>
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-800">Coletando dados para {currentLocation.city}</p>
                            <p className="text-sm text-gray-600">Os primeiros dados aparecerão em alguns minutos...</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Primeira coleta em andamento
                            </Badge>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Configure sua localização</p>
                            <p className="text-sm text-gray-600">Defina sua cidade para ver os dados climáticos</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </div>
  )
})

export default DashboardPage