import type { Response } from 'express';
import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('weather/logs')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Get('insights')
  async getInsights() {
    return this.weatherService.generateInsights();
  }
}