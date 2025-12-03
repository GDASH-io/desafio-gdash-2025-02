import { Controller, Get } from '@nestjs/common';
import { InsightsWeatherService } from './insights-weather.service';

@Controller('weather')
export class InsightsWeatherController {
  constructor(
    private readonly insightsWeatherService: InsightsWeatherService,
  ) {}

  @Get('insights')
  async getInsights() {
    return await this.insightsWeatherService.generateInsights();
  }
}
