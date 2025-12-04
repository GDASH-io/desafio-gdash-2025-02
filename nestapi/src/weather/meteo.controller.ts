import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  BadRequestException,
  NotFoundException,
  Header,
} from '@nestjs/common';
import { WeatherService } from './meteo.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import type { Request } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async createLog(@Body() doc: CreateWeatherLogDto) {
    const saved = await this.weatherService.saveLog(doc);
    return { message: 'Weather log saved', body: saved };
  }

  @Get('logs')
  async getLogs(@Req() req: Request) {
    const userId = req.cookies['userId'];

    if (!userId) {
      throw new BadRequestException('No userId cookie found');
    }

    return this.weatherService.findAll(userId);
  }

  @Get('logs/currentWeek')
  async getCurrentWeek(@Req() req: Request) {
    const userId = req.cookies['userId'];

    if (!userId) {
      throw new BadRequestException('No userId cookie found');
    }

    return this.weatherService.findCurrentWeek(userId);
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="weather_logs.csv"')
  async exportCsv(@Req() req: Request) {
    const userId = req.cookies?.userId;
    if (!userId) throw new BadRequestException('User ID not found in cookies');
    return await this.weatherService.exportCsv(userId);
  }

  @Get('export/csv/:id')
  @Header('Content-Type', 'text/csv')
  async exportCsvById(@Param('id') id: string, @Req() req: Request) {
    const userId = req.cookies?.userId;
    if (!userId) throw new BadRequestException('User ID not found in cookies');
    return await this.weatherService.exportCsvById(id, userId);
  }

  @Get('export/xlsx')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="weather_logs.xlsx"')
  async exportXlsx(@Req() req: Request) {
    const userId = req.cookies?.userId;
    if (!userId) throw new BadRequestException('User ID not found in cookies');
    return await this.weatherService.exportXlsx(userId);
  }

  @Get('export/xlsx/:id')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportXlsxById(@Param('id') id: string, @Req() req: Request) {
    const userId = req.cookies?.userId;
    if (!userId) throw new BadRequestException('User ID not found in cookies');
    return await this.weatherService.exportXlsxById(id, userId);
  }
}
