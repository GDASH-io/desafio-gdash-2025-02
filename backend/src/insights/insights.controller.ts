import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('insights')
@Controller('insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gerar novos insights baseados nos dados recentes' })
  generate() {
    return this.insightsService.generateInsights();
  }

  @Get()
  @ApiOperation({ summary: 'Listar insights gerados' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAll(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '20') || 20;
    return this.insightsService.findAll(limitNum);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obter insights mais recentes (últimos 5)' })
  getLatest() {
    return this.insightsService.getLatest();
  }
}