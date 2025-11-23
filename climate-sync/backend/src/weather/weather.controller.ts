import { Controller, Get } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get('latest')
  getLatest() {
    return this.weatherService.getLatest();
  }

  @Get()
  getAll() {
    return this.weatherService.getAll();
  }
}
