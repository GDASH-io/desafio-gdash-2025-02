import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type Response } from 'express';
import { IsPublic } from 'src/common/decorators/IsPublic';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Throttle({ default: { limit: 5, ttl: 1 * 60 * 1000 } }) // 5 requests per 1 minute
  @IsPublic()
  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    this.weatherService
      .create(createWeatherDto)
      .catch((err) => console.log(err));
    return { message: 'Weather data is being processed' };
  }

  @IsPublic()
  @Get()
  getAllData() {
    return this.weatherService.getWeathers();
  }

  @IsPublic()
  @Get('latest')
  getData() {
    return this.weatherService.getWeather();
  }

  @Get('export/csv')
  async getExportCsv(@Res() response: Response) {
    const csv = await this.weatherService.exportToCsv();

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="weather_data.csv"',
    );
    response.setHeader('Content-Length', csv.length);

    response.send(csv);
  }

  @Get('export/xlsx')
  async getExportXlsx(): Promise<StreamableFile> {
    const readStream = await this.weatherService.exportToXlsx();
    return new StreamableFile(readStream, {
      disposition: 'attachment; filename="weather_data.xlsx"',
      length: readStream.length,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }
}
