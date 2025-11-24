import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express'

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * Endpoint usado pelo worker Go para registrar um novo log de clima.
   */
  @Post('logs')
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    const log = await this.weatherService.create(createWeatherLogDto);
    return log;
  }

  /**
   * Endpoint usado pelo frontend para listar registros.
   * Aqui protegemos com JWT, pois é acesso de usuário.
   */
  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;

    return this.weatherService.findAll(pageNumber, limitNumber);
  }
  
  /**
   * Endpoint usado para exportar como xlsx
   */
  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const buffer = await this.weatherService.generateXlsx();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather_logs.xlsx"',
    );

    res.send(buffer);
  }
  
  /**
   * Endpoint usado para exportar em .csv
   */
  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.weatherService.generateCsv();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather_logs.csv"',
    );

    res.send(csv);
  }
}
