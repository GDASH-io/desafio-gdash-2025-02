import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog } from './schemas/weather-log.schema';
import { Response } from 'express';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherService.findAll();
  }

  @Get('insights')
  async getInsights() {
    const averageTemperature = await this.weatherService.getAverageTemperature();
    const temperatureTrend = await this.weatherService.getTemperatureTrend();
    return {
      averageTemperature: parseFloat(averageTemperature.toFixed(2)),
      temperatureTrend,
      message: `The average temperature is ${averageTemperature.toFixed(2)}°C. ${temperatureTrend}`,
    };
  }

  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    try {
      const data = await this.weatherService.findAll();
      const csv = await this.weatherService.exportCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('weather_logs.csv');
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).send('Error exporting CSV data.');
    }
  }

  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    try {
      const buffer = await this.weatherService.exportXlsx();
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('weather_logs.xlsx');
      return res.send(buffer);
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      res.status(500).send('Error exporting XLSX data.');
    }
  }
}
