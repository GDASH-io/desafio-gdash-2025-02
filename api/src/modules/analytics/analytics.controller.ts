import { Controller, Get, Query } from '@nestjs/common';
import { ParseIsDatePipe } from 'src/common/pipes/parse-date.pipe';
import { ParseIsIntPipe } from 'src/common/pipes/parse-is-int.pipe';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('temperature')
  async getTemperatureAnalytics(
    @Query('type') type?: 'day' | 'hour',
    @Query('date', ParseIsDatePipe) date?: string,
    @Query('limit') limit?: number,
  ) {
    if (!type || type === 'hour') {
      const analytics =
        await this.analyticsService.getTemperatureAnalyticsByHour(date);
      return { analytics };
    }

    if (type === 'day') {
      const analytics =
        await this.analyticsService.getTemperatureAnalyticsByDay(
          limit && Number(limit),
        );
      return { analytics };
    }

    return { analytics: [] };
  }

  @Get('wind-speed')
  async getWindSpeedAnalytics(
    @Query('type') type?: 'day' | 'hour',
    @Query('date', ParseIsDatePipe) date?: string,
    @Query('limit', ParseIsIntPipe) limit?: number,
  ) {
    if (!type || type === 'hour') {
      const analytics =
        await this.analyticsService.getWindSpeedAnalyticsByHour(date);

      return { analytics };
    }
    if (type === 'day') {
      const analytics = await this.analyticsService.getWindSpeedAnalyticsByDay(
        limit && Number(limit),
      );
      return { analytics };
    }

    return { analytics: [] };
  }

  @Get('comparative')
  async getComparativeAnalytics(
    @Query('type') type?: 'day' | 'hour',
    @Query('date', ParseIsDatePipe) date?: string,
    @Query('limit') limit?: number,
  ) {
    if (!type || type === 'hour') {
      const analytics =
        await this.analyticsService.getComparativeAnalyticsByHour(date);
      return { analytics };
    }

    if (type === 'day') {
      const analytics =
        await this.analyticsService.getComparativeAnalyticsByDay(
          limit && Number(limit),
        );
      return { analytics };
    }

    return { analytics: [] };
  }

  private sanitizeQueryParams(params: {
    type?: string;
    date?: string;
    limit?: number | string;
  }): {
    type?: 'day' | 'hour';
    date?: string;
    limit?: number;
  } {
    const sanitizedType =
      params.type &&
      params.type !== 'undefined' &&
      (params.type === 'day' || params.type === 'hour')
        ? params.type
        : undefined;

    const sanitizedDate =
      params.date && params.date !== 'undefined' ? params.date : undefined;

    const sanitizedLimit =
      params.limit &&
      params.limit !== 'undefined' &&
      !isNaN(Number(params.limit))
        ? Number(params.limit)
        : undefined;

    return {
      type: sanitizedType,
      date: sanitizedDate,
      limit: sanitizedLimit,
    };
  }
}
