import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Sse,
  MessageEvent,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common'
import { WeatherService } from './weather.service'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Public } from '../auth/public.decorator'
import { SseAuthGuard } from '../auth/sse-auth.guard'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')

export class WeatherController {
  private readonly logger = new Logger(WeatherController.name)

  constructor(private readonly weatherService: WeatherService) {}

  // Endpoint chamado pelo Go Worker para salvar dados

  @ApiOperation({ summary: 'Salvar dados climáticos', description: 'Endpoint usado pelo Go Worker para salvar dados' })
  @ApiResponse({ status: 200, description: 'Dados salvos com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Post('logs')
  async saveWeatherLog(@Body() weatherData: any) {
    this.logger.log('Recebendo dados via POST /weather/logs (do Go Worker)')
    try {
      const saved = await this.weatherService.saveWeather(weatherData)

      this.logger.log(
        `✅ Dados salvos com sucesso: ${saved.data.temperature}°C`
      )
      return { success: true, id: saved._id }
    } catch (error) {
      this.logger.error('❌ Erro ao salvar dados via POST:', error)
      throw error
    }
  }

  @ApiOperation({ summary: 'Listar logs climáticos', description: 'Retorna logs de dados climáticos com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Logs retornados com sucesso' })
  @Get('logs')
  async getLogs(@Query('limit') limit = 100, @Query('skip') skip = 0) {
    return this.weatherService.findAll(Number(limit), Number(skip))
  }

  
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const data = await this.weatherService.getExportData()

    // Set headers
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_logs.csv'
    )

    // Write CSV header
    res.write('Timestamp,City,Temperature,Humidity,Wind Speed\n')

    // Write data rows
    data.forEach((item: any) => {
      const timestamp = item.timestamp || item.createdAt || ''
      const city = item.location?.city || 'Unknown'
      const temp = item.data?.temperature || 0
      const humidity = item.data?.humidity || 0
      const wind = item.data?.windSpeed ?? item.data?.wind_speed ?? 0

      res.write(`${timestamp},${city},${temp},${humidity},${wind}\n`)
    })

    res.end()
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    return this.exportCsv(res)
  }

 
  @Get('dashboard')
  async getDashboard() {
    this.logger.log('Requisição para /weather/dashboard')
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

 
  @Get('insights')
  async getInsights() {
    this.logger.log('🧠 Requisição para /weather/insights')
    try {
      const insights = await this.weatherService.getInsights()
      return { data: insights }
    } catch (error) {
      this.logger.error('❌ Erro em /insights:', error)
      return {
        data: {
          summary: 'Erro ao gerar insights',
          details: [],
          error: error.message,
        },
      }
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

  // SSE para dados em tempo real (Event-Driven)
  @UseGuards(SseAuthGuard)

  @Sse('realtime')
  async streamWeatherUpdates(): Promise<Observable<MessageEvent>> {
    this.logger.log('Cliente conectado ao SSE /weather/realtime')

    // Últimos 20 registros
    const recent = await this.weatherService.getWeatherForDashboard(20)

    return this.weatherService.weatherUpdates$.asObservable().pipe(
      startWith(
        ...recent.map(d => ({
          data: {
            id: d.id,
            timestamp: d.timestamp,
            temperature: d.temperature ?? 0,
            humidity: d.humidity ?? 0,
            windSpeed: d.windSpeed ?? d.windSpeed ?? 0,
            city: d.city ?? 'Desconhecida',
          },
          type: 'message',
        }))
      )
    )
  }
}
