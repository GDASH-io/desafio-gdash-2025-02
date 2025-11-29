import { Controller, Get, Post, Body, Header, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get() 
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('insights')
  getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv') 
  @Header('Content-Disposition', 'attachment; filename="weather_data.csv"') 
  getExportCsv() {
    return this.weatherService.getCsv();
  }
}