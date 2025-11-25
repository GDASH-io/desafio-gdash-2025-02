import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Weather, WeatherDocument } from '../weather/schema/weather.schema'
import { Subject } from 'rxjs'

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)

  public readonly weatherUpdates$ = new Subject<any>()

  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>
  ) {}

  private getWindSpeed(data: any): number {
    // Tenta camelCase primeiro, depois snake_case como fallback
    return data?.windSpeed ?? data?.wind_speed ?? 0
  }

  async saveWeather(payload: any) {
    this.logger.log('📝 Salvando dados meteorológicos:')
    this.logger.log('Payload completo:', JSON.stringify(payload, null, 2))

    const normalized = {
      timestamp:
        payload.timestamp ?? payload.processed_at ?? new Date().toISOString(),
      data: {
        temperature:
          payload.data?.temperature ??
          payload.data?.temp ??
          payload.temperature ??
          0,
        humidity:
          payload.data?.humidity ?? payload.data?.hum ?? payload.humidity ?? 0,
        windSpeed:
          payload.data?.windSpeed ??
          payload.data?.wind_speed ??
          payload.wind_speed ??
          payload.windSpeed ??
          0,
        ...payload.data,
      },
      location: {
        city: payload.location?.city ?? payload.city ?? 'Unknown',
        state: payload.location?.state,
        country: payload.location?.country,
        latitude: payload.location?.latitude ?? payload.latitude,
        longitude: payload.location?.longitude ?? payload.longitude,
      },
      processed_by: payload.processed_by ?? payload.source ?? undefined,
      raw: payload, 
    }

    const created = await this.weatherModel.create(normalized)

    this.logger.warn('EMITINDO EVENTO SSE!')
    this.weatherUpdates$.next(created)

    return created
  }

  getRealtimeStream() {
    return this.weatherUpdates$.asObservable()
  }

  async getExportData() {
    return this.weatherModel.find().sort({ timestamp: -1 }).lean().exec()
  }

  async findAll(limit = 100, skip = 0) {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
  }

  async filter(filters: any) {
    const q: any = {}
    if (filters.city) q['location.city'] = filters.city
    if (filters.minTemp || filters.maxTemp) {
      q['data.temperature'] = {}
      if (filters.minTemp) q['data.temperature'].$gte = filters.minTemp
      if (filters.maxTemp) q['data.temperature'].$lte = filters.maxTemp
    }
    if (filters.from) q.timestamp = q.timestamp || {}
    if (filters.from) q.timestamp.$gte = filters.from
    if (filters.to) q.timestamp = q.timestamp || {}
    if (filters.to) q.timestamp.$lte = filters.to
    return this.weatherModel.find(q).sort({ timestamp: -1 }).lean().exec()
  }

  // MÉTODOS PARA A DASHBOARD
  async getDashboardMetrics() {
    try {
      this.logger.log('Calculando métricas do dashboard...')

      const allDocs = await this.weatherModel.find().lean().exec()

      if (allDocs.length === 0) {
        return {
          avgTemperature: 0,
          avgHumidity: 0,
          avgWindSpeed: 0,
          totalRecords: 0,
        }
      }

      let totalTemp = 0
      let totalHumidity = 0
      let totalWindSpeed = 0

      allDocs.forEach(doc => {
        totalTemp += doc.data?.temperature || 0
        totalHumidity += doc.data?.humidity || 0
        const windSpeed = doc.data?.windSpeed ?? doc.data?.wind_speed ?? 0
        totalWindSpeed += windSpeed
      })

      const avgTemperature = totalTemp / allDocs.length
      const avgHumidity = totalHumidity / allDocs.length
      const avgWindSpeed = totalWindSpeed / allDocs.length

      this.logger.log('Médias calculadas:', {
        avgTemperature,
        avgHumidity,
        avgWindSpeed,
        totalRecords: allDocs.length,
      })

      return {
        avgTemperature: Number(avgTemperature.toFixed(1)),
        avgHumidity: Number(avgHumidity.toFixed(1)),
        avgWindSpeed: Number(avgWindSpeed.toFixed(1)),
        totalRecords: allDocs.length,
      }
    } catch (error) {
      this.logger.error('Erro ao calcular métricas:', error)
      return {
        avgTemperature: 0,
        avgHumidity: 0,
        avgWindSpeed: 0,
        totalRecords: 0,
      }
    }
  }

  async getAnalytics() {
    try {
      this.logger.log('Calculando analytics...')

      const ranges = [
        { min: -50, max: -10, label: '-50°C a -10°C' },
        { min: -10, max: 0, label: '-10°C a 0°C' },
        { min: 0, max: 10, label: '0°C a 10°C' },
        { min: 10, max: 20, label: '10°C a 20°C' },
        { min: 20, max: 30, label: '20°C a 30°C' },
        { min: 30, max: 50, label: '30°C a 50°C' },
      ]

      const temperatureRanges = []

      for (const range of ranges) {
        const count = await this.weatherModel.countDocuments({
          'data.temperature': {
            $gte: range.min,
            $lt: range.max,
          },
        })

        temperatureRanges.push({
          range: range.label,
          count,
        })
      }

      this.logger.log('Temperature ranges calculados:', temperatureRanges)

      return { temperatureRanges }
    } catch (error) {
      this.logger.error('Erro ao calcular analytics:', error)
      return { temperatureRanges: [] }
    }
  }

  async getRecentWeather(limit = 20) {
    try {
      this.logger.log(`Buscando ${limit} registros recentes...`)

      const recentData = await this.weatherModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec()

      this.logger.log(`Encontrados ${recentData.length} registros`)

      return recentData
    } catch (error) {
      this.logger.error('Erro ao buscar dados recentes:', error)
      return []
    }
  }

  async getWeatherForDashboard(limit = 20) {
    try {
      const recentData = await this.getRecentWeather(limit)

      return recentData.map(item => ({
        id: item._id.toString(),
        city: item.location?.city || 'Unknown',
        temperature: item.data?.temperature || 0,
        humidity: item.data?.humidity || 0,
        windSpeed: this.getWindSpeed(item.data),
        description:
          item.data?.description ||
          (item.data as any)?.weatherCondition ||
          'No description',
        timestamp: item.timestamp || item.createdAt,
      }))
    } catch (error) {
      this.logger.error('Erro ao formatar dados para dashboard:', error)
      return []
    }
  }

  async getLatestWeather() {
    try {
      const latest = await this.weatherModel
        .findOne()
        .sort({ createdAt: -1 })
        .lean()
        .exec()

      if (!latest) return null

      this.logger.log('Documento do MongoDB:', JSON.stringify(latest, null, 2))

      return {
        id: latest._id.toString(),
        city: latest.location?.city || 'Unknown',
        temperature: latest.data?.temperature || 0,
        humidity: latest.data?.humidity || 0,
        windSpeed: this.getWindSpeed(latest.data),
        description:
          latest.data?.description ||
          (latest.data as any)?.weatherCondition ||
          'No description',
        timestamp: latest.timestamp || latest.createdAt,
      }
    } catch (error) {
      this.logger.error('Erro ao buscar último registro:', error)
      return null
    }
  }
}
