import { Injectable } from '@nestjs/common';
import {
  AnalyticsServicePorts,
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
} from '../../ports/analytics.port';

@Injectable()
export class InMemoryAnalyticsAdapter implements AnalyticsServicePorts {
  private mockTemperatureByHour: TemperatureAnalyticsByHourResult[] = [];
  private mockWindSpeedByHour: WindSpeedAnalyticsByHourResult[] = [];
  private mockTemperatureByDay: TemperatureAnalyticsByDayResult[] = [];
  private mockWindSpeedByDay: WindSpeedAnalyticsByDayResult[] = [];
  private mockComparativeByHour: ComparativeAnalyticsByHourResult[] = [];
  private mockComparativeByDay: ComparativeAnalyticsByDayResult[] = [];

  private shouldFailTemperatureByHour = false;
  private shouldFailWindSpeedByHour = false;
  private shouldFailTemperatureByDay = false;
  private shouldFailWindSpeedByDay = false;
  private shouldFailComparativeByHour = false;
  private shouldFailComparativeByDay = false;

  private callCounts = {
    temperatureByHour: 0,
    windSpeedByHour: 0,
    temperatureByDay: 0,
    windSpeedByDay: 0,
    comparativeByHour: 0,
    comparativeByDay: 0,
  };

  private lastParams = {
    temperatureByHourDate: undefined as string | undefined,
    windSpeedByHourDate: undefined as string | undefined,
    temperatureByDayLimit: undefined as number | undefined,
    windSpeedByDayLimit: undefined as number | undefined,
    comparativeByHourDate: undefined as string | undefined,
    comparativeByDayLimit: undefined as number | undefined,
  };

  async getTemperatureAnalyticsByHour(
    date?: string,
  ): Promise<TemperatureAnalyticsByHourResult[]> {
    this.callCounts.temperatureByHour++;
    this.lastParams.temperatureByHourDate = date;

    if (this.shouldFailTemperatureByHour) {
      throw new Error(
        'InMemory Analytics getTemperatureAnalyticsByHour failed',
      );
    }

    return Promise.resolve([...this.mockTemperatureByHour]);
  }

  async getWindSpeedAnalyticsByHour(
    date?: string,
  ): Promise<WindSpeedAnalyticsByHourResult[]> {
    this.callCounts.windSpeedByHour++;
    this.lastParams.windSpeedByHourDate = date;

    if (this.shouldFailWindSpeedByHour) {
      throw new Error('InMemory Analytics getWindSpeedAnalyticsByHour failed');
    }

    return Promise.resolve([...this.mockWindSpeedByHour]);
  }

  async getTemperatureAnalyticsByDay(
    limit?: number,
  ): Promise<TemperatureAnalyticsByDayResult[]> {
    this.callCounts.temperatureByDay++;
    this.lastParams.temperatureByDayLimit = limit;

    if (this.shouldFailTemperatureByDay) {
      throw new Error('InMemory Analytics getTemperatureAnalyticsByDay failed');
    }

    return Promise.resolve([...this.mockTemperatureByDay]);
  }

  async getWindSpeedAnalyticsByDay(
    limit?: number,
  ): Promise<WindSpeedAnalyticsByDayResult[]> {
    this.callCounts.windSpeedByDay++;
    this.lastParams.windSpeedByDayLimit = limit;

    if (this.shouldFailWindSpeedByDay) {
      throw new Error('InMemory Analytics getWindSpeedAnalyticsByDay failed');
    }

    return Promise.resolve([...this.mockWindSpeedByDay]);
  }

  async getComparativeAnalyticsByHour(
    date?: string,
  ): Promise<ComparativeAnalyticsByHourResult[]> {
    this.callCounts.comparativeByHour++;
    this.lastParams.comparativeByHourDate = date;

    if (this.shouldFailComparativeByHour) {
      throw new Error(
        'InMemory Analytics getComparativeAnalyticsByHour failed',
      );
    }

    return Promise.resolve([...this.mockComparativeByHour]);
  }

  async getComparativeAnalyticsByDay(
    limit?: number,
  ): Promise<ComparativeAnalyticsByDayResult[]> {
    this.callCounts.comparativeByDay++;
    this.lastParams.comparativeByDayLimit = limit;

    if (this.shouldFailComparativeByDay) {
      throw new Error('InMemory Analytics getComparativeAnalyticsByDay failed');
    }

    return Promise.resolve([...this.mockComparativeByDay]);
  }

  setMockTemperatureByHour(data: TemperatureAnalyticsByHourResult[]): void {
    this.mockTemperatureByHour = data;
  }

  setMockWindSpeedByHour(data: WindSpeedAnalyticsByHourResult[]): void {
    this.mockWindSpeedByHour = data;
  }

  setMockTemperatureByDay(data: TemperatureAnalyticsByDayResult[]): void {
    this.mockTemperatureByDay = data;
  }

  setMockWindSpeedByDay(data: WindSpeedAnalyticsByDayResult[]): void {
    this.mockWindSpeedByDay = data;
  }

  setMockComparativeByHour(data: ComparativeAnalyticsByHourResult[]): void {
    this.mockComparativeByHour = data;
  }

  setMockComparativeByDay(data: ComparativeAnalyticsByDayResult[]): void {
    this.mockComparativeByDay = data;
  }

  setShouldFailTemperatureByHour(shouldFail: boolean): void {
    this.shouldFailTemperatureByHour = shouldFail;
  }

  setShouldFailWindSpeedByHour(shouldFail: boolean): void {
    this.shouldFailWindSpeedByHour = shouldFail;
  }

  setShouldFailTemperatureByDay(shouldFail: boolean): void {
    this.shouldFailTemperatureByDay = shouldFail;
  }

  setShouldFailWindSpeedByDay(shouldFail: boolean): void {
    this.shouldFailWindSpeedByDay = shouldFail;
  }

  setShouldFailComparativeByHour(shouldFail: boolean): void {
    this.shouldFailComparativeByHour = shouldFail;
  }

  setShouldFailComparativeByDay(shouldFail: boolean): void {
    this.shouldFailComparativeByDay = shouldFail;
  }

  getCallCount(
    method:
      | 'temperatureByHour'
      | 'windSpeedByHour'
      | 'temperatureByDay'
      | 'windSpeedByDay'
      | 'comparativeByHour'
      | 'comparativeByDay',
  ): number {
    return this.callCounts[method];
  }

  getLastParams() {
    return { ...this.lastParams };
  }

  setDefaultTemperatureByHour(): void {
    this.mockTemperatureByHour = [
      { hour: '00:00', temperature: 20.5 },
      { hour: '01:00', temperature: 19.8 },
      { hour: '02:00', temperature: 19.2 },
      { hour: '03:00', temperature: 18.9 },
    ];
  }

  setDefaultWindSpeedByHour(): void {
    this.mockWindSpeedByHour = [
      { hour: '00:00', windSpeed: 10.5 },
      { hour: '01:00', windSpeed: 12.3 },
      { hour: '02:00', windSpeed: 11.8 },
      { hour: '03:00', windSpeed: 9.7 },
    ];
  }

  setDefaultTemperatureByDay(): void {
    this.mockTemperatureByDay = [
      { date: '2025-11-28', temperature: 25.5 },
      { date: '2025-11-27', temperature: 24.8 },
      { date: '2025-11-26', temperature: 26.2 },
    ];
  }

  setDefaultWindSpeedByDay(): void {
    this.mockWindSpeedByDay = [
      { date: '2025-11-28', windSpeed: 15.3 },
      { date: '2025-11-27', windSpeed: 12.7 },
      { date: '2025-11-26', windSpeed: 18.1 },
    ];
  }

  setDefaultComparativeByHour(): void {
    this.mockComparativeByHour = [
      { hour: '00:00', temperature: 20.5, windSpeed: 10.3 },
      { hour: '01:00', temperature: 19.8, windSpeed: 11.5 },
      { hour: '02:00', temperature: 19.2, windSpeed: 12.2 },
    ];
  }

  setDefaultComparativeByDay(): void {
    this.mockComparativeByDay = [
      { date: '2025-11-28', temperature: 25.5, windSpeed: 15.3 },
      { date: '2025-11-27', temperature: 24.8, windSpeed: 12.7 },
      { date: '2025-11-26', temperature: 26.2, windSpeed: 18.1 },
    ];
  }

  reset(): void {
    this.mockTemperatureByHour = [];
    this.mockWindSpeedByHour = [];
    this.mockTemperatureByDay = [];
    this.mockWindSpeedByDay = [];
    this.mockComparativeByHour = [];
    this.mockComparativeByDay = [];

    this.shouldFailTemperatureByHour = false;
    this.shouldFailWindSpeedByHour = false;
    this.shouldFailTemperatureByDay = false;
    this.shouldFailWindSpeedByDay = false;
    this.shouldFailComparativeByHour = false;
    this.shouldFailComparativeByDay = false;

    this.callCounts = {
      temperatureByHour: 0,
      windSpeedByHour: 0,
      temperatureByDay: 0,
      windSpeedByDay: 0,
      comparativeByHour: 0,
      comparativeByDay: 0,
    };

    this.lastParams = {
      temperatureByHourDate: undefined,
      windSpeedByHourDate: undefined,
      temperatureByDayLimit: undefined,
      windSpeedByDayLimit: undefined,
      comparativeByHourDate: undefined,
      comparativeByDayLimit: undefined,
    };
  }
}
