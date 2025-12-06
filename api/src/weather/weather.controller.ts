import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.weatherService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      startDate,
      endDate,
    );
  }

  @Get('logs/statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    return this.weatherService.getStatistics();
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  async exportCSV(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.weatherService.exportToCSV(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_logs.csv',
    );
    res.status(HttpStatus.OK).send(csv);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  async exportXLSX(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.weatherService.exportToXLSX(startDate, endDate);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_logs.xlsx',
    );
    res.status(HttpStatus.OK).send(buffer);
  }
}
