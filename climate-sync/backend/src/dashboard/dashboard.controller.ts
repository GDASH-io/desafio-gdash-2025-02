// dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('dashboard')
//@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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
