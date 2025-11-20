import type { Response } from 'express';
import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather/logs')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: Response) {
    const buffer = await this.weatherService.generateExcelLog('xlsx');

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="clima_logs.xlsx"',
      'Content-Length': buffer.byteLength,
    });

    res.end(buffer);
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const buffer = await this.weatherService.generateExcelLog('csv');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="clima_logs.csv"',
      'Content-Length': buffer.byteLength,
    });

    res.end(buffer);
  }

  @Get('insights')
  async getInsights() {
    return this.weatherService.generateInsights();
  }
}