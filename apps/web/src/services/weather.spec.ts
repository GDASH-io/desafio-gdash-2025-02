import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchWeatherByCoordinates, getExportCsvUrl, getExportXlsxUrl } from './weather'

describe('weather service', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.unstubAllEnvs()
  })

  describe('fetchWeatherByCoordinates', () => {
    it('should fetch and transform weather data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 25,
              relative_humidity_2m: 60,
              wind_speed_10m: 10,
              weather_code: 0,
              precipitation_probability: 20,
            },
          }),
      })

      const result = await fetchWeatherByCoordinates(-23.55, -46.63, 'São Paulo')

      expect(result).toEqual({
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        condition: 'Céu limpo',
        rainProbability: 20,
        location: 'São Paulo',
      })
    })

    it('should handle missing data with defaults', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ current: {} }),
      })

      const result = await fetchWeatherByCoordinates(-23.55, -46.63, 'São Paulo')

      expect(result).toEqual({
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        condition: 'Desconhecido',
        rainProbability: 0,
        location: 'São Paulo',
      })
    })

    it('should handle unknown weather codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            current: { weather_code: 999 },
          }),
      })

      const result = await fetchWeatherByCoordinates(-23.55, -46.63, 'São Paulo')
      expect(result.condition).toBe('Desconhecido')
    })
  })

  describe('export URLs', () => {
    it('should return correct CSV export URL', () => {
      expect(getExportCsvUrl()).toBe('http://localhost:3000/api/weather/export/csv')
    })

    it('should return correct XLSX export URL', () => {
      expect(getExportXlsxUrl()).toBe('http://localhost:3000/api/weather/export/xlsx')
    })
  })
})
