import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { GetInsightsUseCase } from '../../application/usecases/insights/get-insights.use-case';
import { GenerateInsightsUseCase } from '../../application/usecases/insights/generate-insights.use-case';
import { GetInsightsQueryDto } from '../dto/get-insights-query.dto';
import { GenerateInsightsDto } from '../dto/generate-insights.dto';

@Controller('weather/insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(
    private getInsightsUseCase: GetInsightsUseCase,
    private generateInsightsUseCase: GenerateInsightsUseCase,
  ) {}

  @Get()
  async getInsights(@Query() query: GetInsightsQueryDto) {
    try {
      const from = new Date(query.from);
      const to = new Date(query.to);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Datas inválidas');
      }

      if (from >= to) {
        throw new BadRequestException('Data inicial deve ser anterior à data final');
      }

      return this.getInsightsUseCase.execute({
        from,
        to,
        types: query.types,
        forceRegenerate: false,
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Erro ao buscar insights');
    }
  }

  @Post()
  async generateInsights(@Body() body: GenerateInsightsDto) {
    try {
      const from = new Date(body.from);
      const to = new Date(body.to);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Datas inválidas');
      }

      if (from >= to) {
        throw new BadRequestException('Data inicial deve ser anterior à data final');
      }

      return this.generateInsightsUseCase.execute({
        from,
        to,
        types: body.types,
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Erro ao gerar insights');
    }
  }
}

