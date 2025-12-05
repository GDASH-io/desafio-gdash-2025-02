import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  // 🔓 Endpoint público para o GO enviar os dados (sem auth)
  @Post('logs')
  async create(@Body() body: CreateWeatherDto) {
    return this.weatherService.create(body);
  }

  // 🔒 Rotas protegidas
  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async list() {
    return this.weatherService.list();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  async exportCSV(@Res() res: Response) {
    const file = await this.weatherService.exportCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.csv');
    res.send(file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportXLSX();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.xlsx');
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async insights() {
    return this.weatherService.insights();
  }
}
