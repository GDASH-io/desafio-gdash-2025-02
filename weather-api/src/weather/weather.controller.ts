import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('latest')
  getLatest(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.weatherService.findLatest(Number(lat), Number(lon));
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('export/xlsx')
  async exportXLSX(@Res() res: Response) {
    const fileBuffer = await this.weatherService.exportXLSX();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather-data.xlsx"',
    );

    return res.send(fileBuffer);
  }
}
