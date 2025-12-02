// dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
//@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Obter métricas do dashboard', description: 'Retorna estatísticas gerais do sistema' })
  @ApiResponse({ status: 200, description: 'Métricas retornadas com sucesso' })
  @Get()
  async getDashboard() {
    const summary = await this.dashboardService.getDashboardSummary()
    // Mapeando para o formato esperado pelo frontend
    return {
      data: {
        avgTemperature: summary.avgTemperature,
        avgHumidity: summary.avgHumidity,
        avgWindSpeed: summary.avgWindSpeed,
        totalRecords: summary.totalRecords,
      },
    }
  }
}
