import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('process')
  async processAndSave(@Body() payload: any) {
    return this.weatherService.processAndSave(payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.weatherService.findAll();
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  async exportData() {
    return this.weatherService.exportData();
  }
}