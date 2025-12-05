import { Controller, Post, Body, Get } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly service: WeatherService) {}

  @Post('logs')
  create(@Body() body) {
    return this.service.createLog(body);
  }

  @Get('logs')
  all() {
    return this.service.getAll();
  }
}
