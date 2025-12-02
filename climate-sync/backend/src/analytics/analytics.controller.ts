import { Controller, Get, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Obter análises', description: 'Retorna análises e relatórios de dados climáticos' })
  @ApiResponse({ status: 200, description: 'Análises retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @Get()
  getAnalytics() {
    return this.analyticsService.getAnalytics()
  }
}
