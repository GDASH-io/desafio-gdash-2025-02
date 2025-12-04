import { Controller, Get, Post } from '@nestjs/common';
import { WeatherLogsService } from '../weather-logs/weather-logs.service';
import { AiService } from '../ai/ai.service';

@Controller('weather/insights')
export class WeatherInsightsController {
  constructor(
    private readonly logsSvc: WeatherLogsService,
    private readonly ai: AiService,
  ) {}

  @Get()
  async getInsights() {
    const logs = await this.logsSvc.findAll();

    const recentLogs = logs.slice(0, 100);

    const insights = await this.ai.generateInsights(recentLogs);
    return { insights };
  }

  @Post()
  async generateOnDemand() {
    const logs = await this.logsSvc.findAll();
    const recentLogs = logs.slice(0, 100);

    const insights = await this.ai.generateInsights(recentLogs);
    return { insights };
  }
}
