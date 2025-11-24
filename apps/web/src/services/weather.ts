import { InsightType, PaginatedResponseType, WeatherLogType } from '@repo/shared'

import { api } from '@/lib/api'

export interface CurrentWeather {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  rainProbability: number
  location: string
}

const weatherConditions: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Principalmente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Névoa',
  48: 'Névoa com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas leves',
  81: 'Pancadas moderadas',
  82: 'Pancadas fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade forte com granizo',
}

export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<CurrentWeather> {
  const url = 'https://api.open-meteo.com/v1/forecast'
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability',
    timezone: 'America/Sao_Paulo',
  })

  const response = await fetch(`${url}?${params}`)
  const data = await response.json()

  const current = data.current || {}

  return {
    temperature: current.temperature_2m || 0,
    humidity: current.relative_humidity_2m || 0,
    windSpeed: current.wind_speed_10m || 0,
    condition: weatherConditions[current.weather_code] || 'Desconhecido',
    rainProbability: current.precipitation_probability || 0,
    location: locationName,
  }
}

export async function fetchWeatherLogs(
  page = 1,
  limit = 10,
  location?: string,
): Promise<PaginatedResponseType<WeatherLogType>> {
  const response = await api.get('/api/weather/logs', { params: { page, limit, location } })
  return response.data
}

export async function fetchLatestWeather(location?: string): Promise<WeatherLogType | null> {
  const response = await api.get('/api/weather/logs/latest', { params: { location } })
  return response.data
}

export async function collectWeather(
  latitude: number,
  longitude: number,
  location: string,
): Promise<WeatherLogType> {
  const response = await api.post('/api/weather/collect', { latitude, longitude, location })
  return response.data
}

export async function fetchInsights(): Promise<InsightType[]> {
  const response = await api.get('/api/weather/insights')
  return response.data
}

export async function generateInsights(): Promise<InsightType[]> {
  const response = await api.post('/api/weather/insights/generate')
  return response.data
}

export function getExportCsvUrl(): string {
  return `${import.meta.env.VITE_API_BASE_URL}/api/weather/export/csv`
}

export function getExportXlsxUrl(): string {
  return `${import.meta.env.VITE_API_BASE_URL}/api/weather/export/xlsx`
}
