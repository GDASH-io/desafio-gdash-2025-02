import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly service: WeatherService) {}

  @Post('logs')
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.service.create(createWeatherLogDto);
  }

  @Get('logs')
  findAll() {
    return this.service.findAll();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.generateCsv();

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename=clima_gdash.csv');
    res.send(csv);
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: Response) {
    const buffer = await this.service.generateXlsx();

    res.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.set('Content-Disposition', 'attachment; filename=clima_gdash.xlsx');
    res.send(buffer);
  }

  @Get('insights')
  getInsights() {
    return this.service.generateInsights();
  }
}
