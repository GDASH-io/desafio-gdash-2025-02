import { Inject, Injectable } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import {
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
} from 'src/types';
import { AnalyticsServicePorts } from './ports/analytics.port';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(commonConstants.ports.ANALYTICS)
    private readonly analytics: AnalyticsServicePorts,
  ) {}

  getTemperatureAnalyticsByHour(
    date?: string,
  ): Promise<TemperatureAnalyticsByHourResult[]> {
    return this.analytics.getTemperatureAnalyticsByHour(date);
  }

  getWindSpeedAnalyticsByHour(
    date?: string,
  ): Promise<WindSpeedAnalyticsByHourResult[]> {
    return this.analytics.getWindSpeedAnalyticsByHour(date);
  }

  getTemperatureAnalyticsByDay(
    limit?: number,
  ): Promise<TemperatureAnalyticsByDayResult[]> {
    return this.analytics.getTemperatureAnalyticsByDay(limit);
  }

  getWindSpeedAnalyticsByDay(
    limit?: number,
  ): Promise<WindSpeedAnalyticsByDayResult[]> {
    return this.analytics.getWindSpeedAnalyticsByDay(limit);
  }

  getComparativeAnalyticsByHour(
    date?: string,
  ): Promise<ComparativeAnalyticsByHourResult[]> {
    return this.analytics.getComparativeAnalyticsByHour(date);
  }

  getComparativeAnalyticsByDay(
    limit?: number,
  ): Promise<ComparativeAnalyticsByDayResult[]> {
    return this.analytics.getComparativeAnalyticsByDay(limit);
  }
}
