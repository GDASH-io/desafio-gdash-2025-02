import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Weather } from './schemas/weather.schema';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() data: Partial<Weather>) {
    return this.weatherService.create(data);
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Post('filter')
  findByFilter(
    @Body() body: { city?: string; startDate?: string; endDate?: string },
  ) {
    return this.weatherService.findByFilter(body);
  }

  @Get('insights')
  getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export/csv')
  exportCsv() {
    return this.weatherService.exportsCsv();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.weatherService.findById(id);
  }
}
