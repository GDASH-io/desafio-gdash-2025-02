export interface WeatherLogType {
  id: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  rainProbability: number
  location: string
  latitude: number
  longitude: number
  collectedAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateWeatherLogInputType {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  rainProbability: number
  location: string
  latitude: number
  longitude: number
  collectedAt: string
}
