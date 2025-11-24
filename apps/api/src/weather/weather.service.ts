import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginatedResponseType, WeatherLogType } from '@repo/shared'
import * as ExcelJS from 'exceljs'
import { Model } from 'mongoose'

import { CreateWeatherLogDto } from './dto/create-weather-log.dto'
import { WeatherLog } from './weather.schema'

interface WeatherConditions {
  [key: number]: string
}

const weatherConditions: WeatherConditions = {
  0: 'clear',
  1: 'mainly_clear',
  2: 'partly_cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'light_drizzle',
  53: 'moderate_drizzle',
  55: 'dense_drizzle',
  61: 'light_rain',
  63: 'moderate_rain',
  65: 'heavy_rain',
  71: 'light_snow',
  73: 'moderate_snow',
  75: 'heavy_snow',
  80: 'light_showers',
  81: 'moderate_showers',
  82: 'heavy_showers',
  95: 'thunderstorm',
  96: 'thunderstorm_hail',
  99: 'thunderstorm_hail',
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)

  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async create(dto: CreateWeatherLogDto): Promise<WeatherLogType> {
    this.logger.log(`Creating weather log for location: ${dto.location}`)
    const log = await this.weatherModel.create({
      ...dto,
      collectedAt: new Date(dto.collectedAt),
    })
    this.logger.debug(`Weather log created with id: ${log._id}`)
    return this.toWeatherLogType(log)
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    location?: string,
  ): Promise<PaginatedResponseType<WeatherLogType>> {
    const skip = (page - 1) * limit
    const query: Record<string, unknown> = {}

    if (location) {
      query.location = location
    }

    if (startDate || endDate) {
      query.collectedAt = {}
      if (startDate) {
        (query.collectedAt as Record<string, Date>).$gte = new Date(startDate)
      }
      if (endDate) {
        (query.collectedAt as Record<string, Date>).$lte = new Date(endDate)
      }
    }

    const [logs, total] = await Promise.all([
      this.weatherModel
        .find(query)
        .sort({ collectedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherModel.countDocuments(query),
    ])

    return {
      items: logs.map((log) => this.toWeatherLogType(log)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<WeatherLogType> {
    const log = await this.weatherModel.findById(id)
    if (!log) {
      throw new NotFoundException('Weather log not found')
    }
    return this.toWeatherLogType(log)
  }

  async getLatest(location?: string): Promise<WeatherLogType | null> {
    const query: Record<string, unknown> = {}
    if (location) {
      query.location = location
    }
    const log = await this.weatherModel.findOne(query).sort({ collectedAt: -1 })
    return log ? this.toWeatherLogType(log) : null
  }

  async collectWeather(
    latitude: number,
    longitude: number,
    location: string,
  ): Promise<WeatherLogType> {
    this.logger.log(`Collecting weather data for ${location} (${latitude}, ${longitude})`)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability&timezone=America/Sao_Paulo`

    const response = await fetch(url)
    const data = (await response.json()) as { current?: Record<string, number> }
    const current = data.current || {}

    const weatherCode = current.weather_code || 0
    const condition = weatherConditions[weatherCode] || 'unknown'

    this.logger.debug(`Open-Meteo response: temp=${current.temperature_2m}°C, humidity=${current.relative_humidity_2m}%, condition=${condition}`)

    const log = await this.weatherModel.create({
      temperature: current.temperature_2m || 0,
      humidity: current.relative_humidity_2m || 0,
      windSpeed: current.wind_speed_10m || 0,
      condition,
      rainProbability: current.precipitation_probability || 0,
      location,
      latitude,
      longitude,
      collectedAt: new Date(),
    })

    this.logger.log(`Weather data collected and saved for ${location}`)
    return this.toWeatherLogType(log)
  }

  async exportToCsv(): Promise<string> {
    const logs = await this.weatherModel.find().sort({ collectedAt: -1 })

    const headers = [
      'ID',
      'Temperature',
      'Humidity',
      'Wind Speed',
      'Condition',
      'Rain Probability',
      'Location',
      'Latitude',
      'Longitude',
      'Collected At',
    ]

    const rows = logs.map((log) => [
      log._id.toString(),
      log.temperature,
      log.humidity,
      log.windSpeed,
      log.condition,
      log.rainProbability,
      log.location,
      log.latitude,
      log.longitude,
      log.collectedAt.toISOString(),
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n',
    )
    return csv
  }

  async exportToXlsx(): Promise<Buffer> {
    const logs = await this.weatherModel.find().sort({ collectedAt: -1 })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Weather Logs')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Temperature (°C)', key: 'temperature', width: 15 },
      { header: 'Humidity (%)', key: 'humidity', width: 12 },
      { header: 'Wind Speed (km/h)', key: 'windSpeed', width: 18 },
      { header: 'Condition', key: 'condition', width: 20 },
      { header: 'Rain Probability (%)', key: 'rainProbability', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Collected At', key: 'collectedAt', width: 25 },
    ]

    logs.forEach((log) => {
      worksheet.addRow({
        id: log._id.toString(),
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
        condition: log.condition,
        rainProbability: log.rainProbability,
        location: log.location,
        latitude: log.latitude,
        longitude: log.longitude,
        collectedAt: log.collectedAt.toISOString(),
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  private toWeatherLogType(log: WeatherLog): WeatherLogType {
    return {
      id: log._id.toString(),
      temperature: log.temperature,
      humidity: log.humidity,
      windSpeed: log.windSpeed,
      condition: log.condition,
      rainProbability: log.rainProbability,
      location: log.location,
      latitude: log.latitude,
      longitude: log.longitude,
      collectedAt: log.collectedAt.toISOString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    }
  }
}
