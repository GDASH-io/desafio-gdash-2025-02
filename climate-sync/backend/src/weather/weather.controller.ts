import { Controller, Get, Logger, Sse, MessageEvent } from '@nestjs/common'
import { WeatherService } from './weather.service'
import { Observable, interval, from } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name)

  constructor(private readonly weatherService: WeatherService) {}

  @Get('dashboard')
  async getDashboard() {
    this.logger.log('📊 Requisição para /weather/dashboard')
    try {
      const metrics = await this.weatherService.getDashboardMetrics()
      this.logger.log('Métricas retornadas:', metrics)
      return { data: metrics }
    } catch (error) {
      this.logger.error('❌ Erro em /dashboard:', error)
      return {
        data: {
          avgTemperature: 0,
          avgHumidity: 0,
          avgWindSpeed: 0,
          totalRecords: 0,
        },
      }
    }
  }

  @Get('analytics')
  async getAnalytics() {
    this.logger.log('📈 Requisição para /weather/analytics')
    try {
      const analytics = await this.weatherService.getAnalytics()
      this.logger.log('Analytics retornados:', analytics)
      return { data: analytics }
    } catch (error) {
      this.logger.error('❌ Erro em /analytics:', error)
      return { data: { temperatureRanges: [] } }
    }
  }

  @Get()
  async getAll() {
    this.logger.log('🌤️  Requisição para /weather')
    try {
      const data = await this.weatherService.getWeatherForDashboard()
      this.logger.log(`Retornando ${data.length} registros`)
      return data
    } catch (error) {
      this.logger.error('❌ Erro em /weather:', error)
      return []
    }
  }

  @Get('recent')
  async getRecent() {
    this.logger.log('🕒 Requisição para /weather/recent')
    try {
      const data = await this.weatherService.getWeatherForDashboard(20)
      this.logger.log(`Retornando ${data.length} registros recentes`)
      return data
    } catch (error) {
      this.logger.error('❌ Erro em /recent:', error)
      return []
    }
  }

  // SSE para dados em tempo real - CORRIGIDO
  @Sse('realtime')
  streamWeatherUpdates(): Observable<MessageEvent> {
    this.logger.log('🔴 Cliente conectado ao stream /weather/realtime')
    
    return interval(5000).pipe(
      switchMap(() => 
        from(this.weatherService.getLatestWeather()).pipe(
          map(latestData => {
            this.logger.log('Enviando atualização em tempo real:', latestData)
            return {
              data: latestData,
              type: 'message'
            } as MessageEvent
          })
        )
      )
    )
  }
}