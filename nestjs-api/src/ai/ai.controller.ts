import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class WeatherDto {
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @IsNumber()
  @IsNotEmpty()
  weathercode: number;

  @IsNumber()
  @IsOptional()
  precipitation_probability?: number;
}

@ApiTags('IA')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendations')
  @ApiOperation({ summary: 'Obter recomendações de filmes baseadas no clima' })
  getRecommendations(@Body() weatherData: WeatherDto) {
    return this.aiService.getMovieRecommendationsByWeather(weatherData);
  }
}
