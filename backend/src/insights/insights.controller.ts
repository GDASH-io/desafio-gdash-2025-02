import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InsightsService, InsightResult } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('insights')
@Controller('insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('weather')
  @ApiOperation({ summary: 'Gerar insights de clima baseados em IA' })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['24h', '7d', '30d'], example: '24h' })
  @ApiQuery({ name: 'city', required: false, example: 'Maceió' })
  async getWeatherInsights(
    @Query('timeRange') timeRange: '24h' | '7d' | '30d' = '24h',
    @Query('city') city?: string,
  ): Promise<InsightResult> {
    return this.insightsService.generateInsights(timeRange, city);
  }
}

