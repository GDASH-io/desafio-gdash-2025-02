import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weather/insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  async getInsights(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 7;
    const insights = await this.insightsService.generateInsights(daysNumber);
    return {
      ...insights,
      generatedAt: new Date().toISOString(),
    };
  }
}
