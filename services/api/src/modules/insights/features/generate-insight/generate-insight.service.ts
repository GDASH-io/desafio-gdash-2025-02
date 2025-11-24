import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FindLogsService } from '../../../weather/features/find-logs/find-logs.service';
import { GroqService } from './groq.service';
import { GenerateInsightDto, InsightContext } from '../../dto/generate-insight.dto';
import { ERROR_MESSAGES } from '../../../../shared/constants/errors';

@Injectable()
export class GenerateInsightService {
  constructor(
    private readonly findLogsService: FindLogsService,
    private readonly groqService: GroqService,
  ) {}

  async generate(generateInsightDto: GenerateInsightDto) {
    const { city, state, startDate, endDate, context, customPrompt } = generateInsightDto;

    const weatherData = await this.findLogsService.findAll({
      city,
      state,
      startDate,
      endDate,
      limit: 50,
    });

    if (!weatherData.data || weatherData.data.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.INSIGHTS.NO_DATA);
    }

    const simplifiedData = weatherData.data.map(log => ({
      timestamp: log.timestamp,
      city: log.city,
      state: log.state,
      temperature: log.temperature,
      feelsLike: log.feelsLike,
      humidity: log.humidity,
      windSpeed: log.windSpeed,
      condition: log.condition,
      rainProbability: log.rainProbability,
      uvIndex: log.uvIndex,
    }));

    try {
      const insights = await this.groqService.generateWeatherInsight(
        simplifiedData,
        context || InsightContext.GENERAL,
        customPrompt,
      );

      return {
        insights,
        context: context || InsightContext.GENERAL,
        dataCount: weatherData.data.length,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        location: {
          city,
          state,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `${ERROR_MESSAGES.INSIGHTS.GENERATION_FAILED}: ${error.message}`,
      );
    }
  }
}
