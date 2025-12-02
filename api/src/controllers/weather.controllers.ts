import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';
import type { Response } from 'express';


@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // Endpoint para coletar dados atuais
  @Get('current')
  async getCurrentWeather() {
    return this.weatherService.fetchCurrentWeather();
  }

  // Endpoint para salvar logs (usado pelo worker)
  @Post('logs')
  async createLog(@Body() data: any) {
    return this.weatherService.saveWeatherLog(data);
  }

  @Get('logs')
  async list() {
    return this.weatherService.listLogs();
  }

  @Get('export.csv')
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportCSV();
    res.header('Content-Type', 'text/csv');
    res.attachment('weather_logs.csv');
    return res.send(csv);
  }

 @Get('export.xlsx')
async exportXLSX(@Res() res: Response) {
  const buffer = await this.weatherService.exportXLSX();
  res.header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.attachment('weather_logs.xlsx');
  return res.send(buffer);
}

  @Get('insights')
  async insights() {
    return this.weatherService.insights();
  }
}
