import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerateInsightService } from './generate-insight.service';
import { GenerateInsightDto } from '../../dto/generate-insight.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.INSIGHTS.BASE)
@UseGuards(JwtAuthGuard)
export class GenerateInsightController {
  constructor(private readonly generateInsightService: GenerateInsightService) {}

  @Post(API_ROUTES.INSIGHTS.GENERATE)
  @HttpCode(HttpStatus.OK)
  async generate(@Body() generateInsightDto: GenerateInsightDto) {
    return this.generateInsightService.generate(generateInsightDto);
  }
}
