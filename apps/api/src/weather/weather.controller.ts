import { Body, Controller, Get, Header, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  createLog(@Body() payload: CreateWeatherLogDto) {
    return this.weatherService.create(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  getLogs() {
    return this.weatherService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=weather-logs.csv')
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportCSV();
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=weather-logs.xlsx')
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportXLSX();
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async getInsights() {
    return this.weatherService.generateInsights();
  }
}

