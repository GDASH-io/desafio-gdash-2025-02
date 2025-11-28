import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('weather') // /api/weather
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs') // /api/weather/logs
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    console.log('Recebendo dados do Worker Go:', createWeatherLogDto);
    return this.weatherService.create(createWeatherLogDto);
  }

  @UseGuards(AuthGuard) // Protege os logs
  @Get('logs')
  findAll(@Query('date') date?: string) {
    return this.weatherService.findAll(date);
  }

  @UseGuards(AuthGuard)
  @Get('insight-now')
  async getInstantInsight(@Query('date') date?: string) {
    return this.weatherService.getAnalysisForDate(date);
  }

  @UseGuards(AuthGuard)
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const buffer = await this.weatherService.exportWeatherData('csv');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="historico_clima.csv"',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @UseGuards(AuthGuard)
  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const buffer = await this.weatherService.exportWeatherData('xlsx');

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="historico_clima.xlsx"',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
