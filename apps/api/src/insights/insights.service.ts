import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  InsightSeverityEnum,
  InsightType,
  InsightTypeEnum,
} from '@repo/shared'
import { Model } from 'mongoose'

import { WeatherLog } from '../weather/weather.schema'
import { Insight } from './insight.schema'

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name)

  constructor(
    @InjectModel(Insight.name) private insightModel: Model<Insight>,
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async generateInsights(): Promise<InsightType[]> {
    this.logger.log('Generating insights from weather data')
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const logs = await this.weatherModel
      .find({ collectedAt: { $gte: last24h } })
      .sort({ collectedAt: -1 })
      .exec()

    if (logs.length === 0) {
      this.logger.warn('No weather logs found in the last 24h')
      return []
    }

    this.logger.debug(`Found ${logs.length} weather logs for analysis`)

    const insights: InsightType[] = []

    // Temperature trend
    const tempTrend = this.analyzeTemperatureTrend(logs)
    if (tempTrend) insights.push(tempTrend)

    // Rain alert
    const rainAlert = this.analyzeRainProbability(logs)
    if (rainAlert) insights.push(rainAlert)

    // Comfort score
    const comfort = this.calculateComfortScore(logs)
    if (comfort) insights.push(comfort)

    // Daily summary
    const summary = this.generateDailySummary(logs)
    if (summary) insights.push(summary)

    // Extreme weather
    const extreme = this.detectExtremeWeather(logs)
    if (extreme) insights.push(extreme)

    // Save insights
    await this.insightModel.deleteMany({})
    for (const insight of insights) {
      await this.insightModel.create({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        data: insight.data,
        generatedAt: new Date(),
      })
    }

    this.logger.log(`Generated ${insights.length} insights`)
    return insights
  }

  async getInsights(): Promise<InsightType[]> {
    const insights = await this.insightModel.find().sort({ createdAt: -1 })
    return insights.map((i) => this.toInsightType(i))
  }

  private analyzeTemperatureTrend(logs: WeatherLog[]): InsightType | null {
    if (logs.length < 2) return null

    const temps = logs.map((l) => l.temperature)
    const avgRecent = temps.slice(0, Math.ceil(temps.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(temps.length / 2)
    const avgOld = temps.slice(Math.ceil(temps.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(temps.length / 2)

    const diff = avgRecent - avgOld
    const trend = diff > 1 ? 'subindo' : diff < -1 ? 'caindo' : 'estável'

    return {
      id: '',
      type: InsightTypeEnum.TEMPERATURE_TREND,
      title: `Temperatura ${trend}`,
      description: `A temperatura está ${trend}. Média recente: ${avgRecent.toFixed(1)}°C, média anterior: ${avgOld.toFixed(1)}°C.`,
      severity: Math.abs(diff) > 3 ? InsightSeverityEnum.WARNING : InsightSeverityEnum.INFO,
      data: { avgRecent, avgOld, trend },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  private analyzeRainProbability(logs: WeatherLog[]): InsightType | null {
    const latest = logs[0]
    if (!latest || latest.rainProbability < 30) return null

    const severity = latest.rainProbability >= 70
      ? InsightSeverityEnum.ALERT
      : latest.rainProbability >= 50
        ? InsightSeverityEnum.WARNING
        : InsightSeverityEnum.INFO

    return {
      id: '',
      type: InsightTypeEnum.RAIN_ALERT,
      title: 'Previsão de chuva',
      description: `Probabilidade de chuva: ${latest.rainProbability}%. ${severity === InsightSeverityEnum.ALERT ? 'Alta chance de precipitação!' : 'Considere levar um guarda-chuva.'}`,
      severity,
      data: { rainProbability: latest.rainProbability },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  private calculateComfortScore(logs: WeatherLog[]): InsightType | null {
    const latest = logs[0]
    if (!latest) return null

    // Comfort index based on temp (ideal 20-25), humidity (ideal 40-60), wind (<15 km/h)
    let score = 100

    // Temperature penalty
    if (latest.temperature < 15 || latest.temperature > 30) score -= 30
    else if (latest.temperature < 18 || latest.temperature > 28) score -= 15

    // Humidity penalty
    if (latest.humidity < 30 || latest.humidity > 80) score -= 25
    else if (latest.humidity < 40 || latest.humidity > 70) score -= 10

    // Wind penalty
    if (latest.windSpeed > 25) score -= 20
    else if (latest.windSpeed > 15) score -= 10

    // Rain penalty
    if (latest.rainProbability > 50) score -= 15

    score = Math.max(0, Math.min(100, score))

    const classification = score >= 75 ? 'Agradável' : score >= 50 ? 'Moderado' : 'Desconfortável'

    return {
      id: '',
      type: InsightTypeEnum.COMFORT_SCORE,
      title: `Conforto climático: ${classification}`,
      description: `Índice de conforto: ${score}/100. ${classification === 'Agradável' ? 'Ótimo dia para atividades ao ar livre!' : classification === 'Moderado' ? 'Condições aceitáveis.' : 'Condições climáticas desfavoráveis.'}`,
      severity: score >= 50 ? InsightSeverityEnum.INFO : InsightSeverityEnum.WARNING,
      data: { score, classification },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  private generateDailySummary(logs: WeatherLog[]): InsightType | null {
    if (logs.length === 0) return null

    const temps = logs.map((l) => l.temperature)
    const humidities = logs.map((l) => l.humidity)
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length
    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)

    return {
      id: '',
      type: InsightTypeEnum.DAILY_SUMMARY,
      title: 'Resumo do dia',
      description: `Temperatura média: ${avgTemp.toFixed(1)}°C (min: ${minTemp.toFixed(1)}°C, max: ${maxTemp.toFixed(1)}°C). Umidade média: ${avgHumidity.toFixed(0)}%. Baseado em ${logs.length} medições.`,
      severity: InsightSeverityEnum.INFO,
      data: { avgTemp, minTemp, maxTemp, avgHumidity, measurements: logs.length },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  private detectExtremeWeather(logs: WeatherLog[]): InsightType | null {
    const latest = logs[0]
    if (!latest) return null

    if (latest.temperature >= 35) {
      return {
        id: '',
        type: InsightTypeEnum.EXTREME_WEATHER,
        title: 'Calor extremo',
        description: `Temperatura de ${latest.temperature}°C! Mantenha-se hidratado e evite exposição prolongada ao sol.`,
        severity: InsightSeverityEnum.ALERT,
        data: { temperature: latest.temperature },
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    }

    if (latest.temperature <= 5) {
      return {
        id: '',
        type: InsightTypeEnum.EXTREME_WEATHER,
        title: 'Frio intenso',
        description: `Temperatura de ${latest.temperature}°C! Vista-se adequadamente e evite exposição prolongada ao frio.`,
        severity: InsightSeverityEnum.ALERT,
        data: { temperature: latest.temperature },
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    }

    if (latest.windSpeed >= 40) {
      return {
        id: '',
        type: InsightTypeEnum.EXTREME_WEATHER,
        title: 'Ventos fortes',
        description: `Velocidade do vento: ${latest.windSpeed} km/h. Evite atividades ao ar livre e mantenha objetos seguros.`,
        severity: InsightSeverityEnum.ALERT,
        data: { windSpeed: latest.windSpeed },
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    }

    return null
  }

  private toInsightType(insight: Insight): InsightType {
    return {
      id: insight._id.toString(),
      type: insight.type,
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      data: insight.data,
      generatedAt: insight.generatedAt.toISOString(),
      createdAt: insight.createdAt.toISOString(),
    }
  }
}
