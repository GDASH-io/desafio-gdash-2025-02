import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
