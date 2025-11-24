// src/weather/dto/create-weather.dto.ts
export class CreateWeatherDto {
  city: string
  temperature: number
  humidity: number
  windSpeed: number
  description?: string
}

// src/weather/dto/weather-response.dto.ts
export class WeatherResponseDto {
  id: string
  city: string
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  timestamp: Date
}

// src/weather/dto/dashboard-metrics.dto.ts
export class DashboardMetricsDto {
  avgTemperature: number
  avgHumidity: number
  avgWindSpeed: number
  totalRecords: number
}

// src/weather/dto/analytics-data.dto.ts
export class TemperatureRange {
  range: string
  count: number
}

export class AnalyticsDataDto {
  temperatureRanges: TemperatureRange[]
}
