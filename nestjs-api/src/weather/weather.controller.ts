import { Controller, Get, Post, Body, Query, Logger, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async receiveFromGoWorker(@Body() createWeatherDto: CreateWeatherDto) {
    this.logger.log('🚀 POST /api/weather/logs - Recebendo do Go Worker');
    return this.weatherService.create(createWeatherDto);
  }

  @Get('logs')
  async getAllLogs(@Query('limit') limit?: number) {
    this.logger.log('📊 GET /api/weather/logs - Listando registros');
    return this.weatherService.findAll(limit ? parseInt(limit.toString()) : 100);
  }

  @Get('recent')
  async getRecentLogs(@Query('hours') hours?: number) {
    this.logger.log(`⏱️ GET /api/weather/recent - Últimas ${hours || 24}h`);
    return this.weatherService.findRecent(hours ? parseInt(hours.toString()) : 24);
  }

  @Get('stats')
  async getStats() {
    this.logger.log('📈 GET /api/weather/stats - Estatísticas');
    return this.weatherService.getStats();
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="weather_data.csv"')
  async exportCSV(@Res() res: Response, @Query('limit') limit?: number) {
    this.logger.log('📄 GET /api/weather/export.csv - Exportando CSV');
    const csv = await this.weatherService.exportToCSV(limit ? parseInt(limit.toString()) : 1000);
    res.send(csv);
  }

  @Get('export.xlsx')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="weather_data.xlsx"')
  async exportXLSX(@Res() res: Response, @Query('limit') limit?: number) {
    this.logger.log('📊 GET /api/weather/export.xlsx - Exportando XLSX');
    const buffer = await this.weatherService.exportToXLSX(
      limit ? parseInt(limit.toString()) : 1000,
    );
    res.send(buffer);
  }

  @Get('insights')
  async getInsights(@Query('hours') hours?: number) {
    this.logger.log(`🤖 GET /api/weather/insights - Gerando insights`);
    return this.weatherService.generateInsights(hours ? parseInt(hours.toString()) : 24);
  }
}
