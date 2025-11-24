import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { InsightsService } from './insights.service'

@ApiTags('Insights')
@ApiBearerAuth()
@Controller('weather/insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current insights' })
  getInsights() {
    return this.insightsService.getInsights()
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate new insights based on weather data' })
  generateInsights() {
    return this.insightsService.generateInsights()
  }
}
