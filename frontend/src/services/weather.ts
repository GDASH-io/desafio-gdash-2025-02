import api from './api'

export interface WeatherLog {
  _id: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
    city?: string
  }
  current: {
    temperature: number
    humidity: number
    wind_speed: number
    weather_code: number
  }
  forecast: {
    hourly: Array<{
      time: string
      temperature?: number
      humidity?: number
      wind_speed?: number
      precipitation_probability?: number
      weather_code?: number
    }>
  }
}

export interface WeatherLogsResponse {
  data: WeatherLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InsightsResponse {
  summary: string
  statistics: {
    averageTemperature: number
    minTemperature: number
    maxTemperature: number
    averageHumidity: number
    averageWindSpeed: number
    temperatureTrend: 'increasing' | 'decreasing' | 'stable'
    humidityTrend: 'increasing' | 'decreasing' | 'stable'
  }
  comfortScore: number
  dayClassification: 'frio' | 'quente' | 'agradável' | 'chuvoso' | 'variável'
  alerts: Array<{
    type: 'rain' | 'heat' | 'cold' | 'wind' | 'humidity'
    severity: 'low' | 'medium' | 'high'
    message: string
  }>
  periodAnalysis: {
    days: number
    totalRecords: number
    dateRange: {
      start: string
      end: string
    }
  }
  recommendations: string[]
  generatedAt: string
}

export const weatherService = {
  async getLogs(
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string
  ): Promise<WeatherLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    params.append('_t', Date.now().toString())

    const response = await api.get<{ success: boolean; data: WeatherLogsResponse }>(
      `/weather/logs?${params.toString()}`
    )
    return response.data.data || response.data
  },

  async getInsights(days: number = 7): Promise<InsightsResponse> {
    const response = await api.get<{ success: boolean; data: InsightsResponse }>(
      `/weather/insights?days=${days}&_t=${Date.now()}`
    )
    return response.data.data || response.data
  },

  async exportCSV(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/weather/export.csv?${params.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportXLSX(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/weather/export.xlsx?${params.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  },
}

