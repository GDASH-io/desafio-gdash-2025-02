import {
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
} from 'src/types';

export {
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
};

export interface AnalyticsServicePorts {
  getTemperatureAnalyticsByHour(
    date?: string,
  ): Promise<TemperatureAnalyticsByHourResult[]>;
  getWindSpeedAnalyticsByHour(
    date?: string,
  ): Promise<WindSpeedAnalyticsByHourResult[]>;
  getTemperatureAnalyticsByDay(
    limit?: number,
  ): Promise<TemperatureAnalyticsByDayResult[]>;
  getWindSpeedAnalyticsByDay(
    limit?: number,
  ): Promise<WindSpeedAnalyticsByDayResult[]>;
  getComparativeAnalyticsByHour(
    date?: string,
  ): Promise<ComparativeAnalyticsByHourResult[]>;
  getComparativeAnalyticsByDay(
    limit?: number,
  ): Promise<ComparativeAnalyticsByDayResult[]>;
}
