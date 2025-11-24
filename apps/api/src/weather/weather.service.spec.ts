import { NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WeatherLog } from './weather.schema'
import { WeatherService } from './weather.service'

describe('WeatherService', () => {
  let service: WeatherService
  let mockWeatherModel: any

  const mockWeatherLog = {
    _id: { toString: () => 'log-id-123' },
    temperature: 25.5,
    humidity: 60,
    windSpeed: 10,
    condition: 'clear',
    rainProbability: 20,
    location: 'São Paulo, SP',
    latitude: -23.55,
    longitude: -46.63,
    collectedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockWeatherModel = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      countDocuments: vi.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherModel,
        },
      ],
    }).compile()

    service = module.get<WeatherService>(WeatherService)
  })

  describe('create', () => {
    it('should create a weather log', async () => {
      mockWeatherModel.create.mockResolvedValue(mockWeatherLog)

      const result = await service.create({
        temperature: 25.5,
        humidity: 60,
        windSpeed: 10,
        condition: 'clear',
        rainProbability: 20,
        location: 'São Paulo, SP',
        latitude: -23.55,
        longitude: -46.63,
        collectedAt: new Date().toISOString(),
      })

      expect(result.temperature).toBe(25.5)
      expect(result.location).toBe('São Paulo, SP')
    })
  })

  describe('findById', () => {
    it('should return weather log by id', async () => {
      mockWeatherModel.findById.mockResolvedValue(mockWeatherLog)

      const result = await service.findById('log-id-123')

      expect(result.id).toBe('log-id-123')
    })

    it('should throw NotFoundException when log not found', async () => {
      mockWeatherModel.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getLatest', () => {
    it('should return latest weather log', async () => {
      mockWeatherModel.findOne.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockWeatherLog),
      })

      const result = await service.getLatest()

      expect(result?.temperature).toBe(25.5)
    })

    it('should return null when no logs exist', async () => {
      mockWeatherModel.findOne.mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      })

      const result = await service.getLatest()

      expect(result).toBeNull()
    })

    it('should filter by location', async () => {
      mockWeatherModel.findOne.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockWeatherLog),
      })

      const result = await service.getLatest('São Paulo, SP')

      expect(result?.location).toBe('São Paulo, SP')
    })
  })

  describe('findAll', () => {
    it('should return paginated weather logs', async () => {
      mockWeatherModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue([mockWeatherLog]),
            }),
          }),
        }),
      })
      mockWeatherModel.countDocuments.mockResolvedValue(1)

      const result = await service.findAll(1, 10)

      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })
  })

  describe('collectWeather', () => {
    it('should collect weather from Open-Meteo API', async () => {
      const mockApiResponse = {
        current: {
          temperature_2m: 28.0,
          relative_humidity_2m: 55,
          weather_code: 0,
          wind_speed_10m: 12,
          precipitation_probability: 10,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockApiResponse),
      })

      mockWeatherModel.create.mockResolvedValue({
        ...mockWeatherLog,
        temperature: 28.0,
        humidity: 55,
      })

      const result = await service.collectWeather(-23.55, -46.63, 'São Paulo, SP')

      expect(result.location).toBe('São Paulo, SP')
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
