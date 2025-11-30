import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { AnalyticsService } from '../analytics.service';
import { InMemoryAnalyticsAdapter } from '../infraestructure/adapters/inMemory-analytics.adapter';
import {
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
} from '../ports/analytics.port';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsAdapter: InMemoryAnalyticsAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: commonConstants.ports.ANALYTICS,
          useClass: InMemoryAnalyticsAdapter,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    analyticsAdapter = module.get<InMemoryAnalyticsAdapter>(
      commonConstants.ports.ANALYTICS,
    );

    // Reset adapter before each test
    analyticsAdapter.reset();
  });

  describe('getTemperatureAnalyticsByHour', () => {
    const mockTemperatureByHour: TemperatureAnalyticsByHourResult[] = [
      { hour: '00:00', temperature: 20.5 },
      { hour: '01:00', temperature: 19.8 },
      { hour: '02:00', temperature: 19.2 },
      { hour: '03:00', temperature: 18.9 },
    ];

    it('should call analytics port and return temperature data by hour', async () => {
      analyticsAdapter.setMockTemperatureByHour(mockTemperatureByHour);

      const result = await service.getTemperatureAnalyticsByHour();

      expect(analyticsAdapter.getCallCount('temperatureByHour')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().temperatureByHourDate,
      ).toBeUndefined();
      expect(result).toEqual(mockTemperatureByHour);
      expect(result).toHaveLength(4);
    });

    it('should pass date parameter to analytics port', async () => {
      const date = '2025-11-28';
      analyticsAdapter.setMockTemperatureByHour(mockTemperatureByHour);

      const result = await service.getTemperatureAnalyticsByHour(date);

      expect(analyticsAdapter.getLastParams().temperatureByHourDate).toBe(date);
      expect(result).toEqual(mockTemperatureByHour);
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockTemperatureByHour([]);

      const result = await service.getTemperatureAnalyticsByHour();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailTemperatureByHour(true);

      await expect(service.getTemperatureAnalyticsByHour()).rejects.toThrow(
        'InMemory Analytics getTemperatureAnalyticsByHour failed',
      );
    });
  });

  describe('getWindSpeedAnalyticsByHour', () => {
    const mockWindSpeedByHour: WindSpeedAnalyticsByHourResult[] = [
      { hour: '00:00', windSpeed: 10.5 },
      { hour: '01:00', windSpeed: 12.3 },
      { hour: '02:00', windSpeed: 11.8 },
      { hour: '03:00', windSpeed: 9.7 },
    ];

    it('should call analytics port and return wind speed data by hour', async () => {
      analyticsAdapter.setMockWindSpeedByHour(mockWindSpeedByHour);

      const result = await service.getWindSpeedAnalyticsByHour();

      expect(analyticsAdapter.getCallCount('windSpeedByHour')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().windSpeedByHourDate,
      ).toBeUndefined();
      expect(result).toEqual(mockWindSpeedByHour);
      expect(result).toHaveLength(4);
    });

    it('should pass date parameter to analytics port', async () => {
      const date = '2025-11-28';
      analyticsAdapter.setMockWindSpeedByHour(mockWindSpeedByHour);

      const result = await service.getWindSpeedAnalyticsByHour(date);

      expect(analyticsAdapter.getLastParams().windSpeedByHourDate).toBe(date);
      expect(result).toEqual(mockWindSpeedByHour);
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockWindSpeedByHour([]);

      const result = await service.getWindSpeedAnalyticsByHour();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailWindSpeedByHour(true);

      await expect(service.getWindSpeedAnalyticsByHour()).rejects.toThrow(
        'InMemory Analytics getWindSpeedAnalyticsByHour failed',
      );
    });
  });

  describe('getTemperatureAnalyticsByDay', () => {
    const mockTemperatureByDay: TemperatureAnalyticsByDayResult[] = [
      { date: '2025-11-28', temperature: 25.5 },
      { date: '2025-11-27', temperature: 24.8 },
      { date: '2025-11-26', temperature: 26.2 },
    ];

    it('should call analytics port and return temperature data by day', async () => {
      analyticsAdapter.setMockTemperatureByDay(mockTemperatureByDay);

      const result = await service.getTemperatureAnalyticsByDay();

      expect(analyticsAdapter.getCallCount('temperatureByDay')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().temperatureByDayLimit,
      ).toBeUndefined();
      expect(result).toEqual(mockTemperatureByDay);
      expect(result).toHaveLength(3);
    });

    it('should pass limit parameter to analytics port', async () => {
      const limit = 7;
      analyticsAdapter.setMockTemperatureByDay(mockTemperatureByDay);

      const result = await service.getTemperatureAnalyticsByDay(limit);

      expect(analyticsAdapter.getLastParams().temperatureByDayLimit).toBe(
        limit,
      );
      expect(result).toEqual(mockTemperatureByDay);
    });

    it('should handle limit of 1', async () => {
      const singleDay = [mockTemperatureByDay[0]];
      analyticsAdapter.setMockTemperatureByDay(singleDay);

      const result = await service.getTemperatureAnalyticsByDay(1);

      expect(analyticsAdapter.getLastParams().temperatureByDayLimit).toBe(1);
      expect(result).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockTemperatureByDay([]);

      const result = await service.getTemperatureAnalyticsByDay();

      expect(result).toEqual([]);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailTemperatureByDay(true);

      await expect(service.getTemperatureAnalyticsByDay()).rejects.toThrow(
        'InMemory Analytics getTemperatureAnalyticsByDay failed',
      );
    });
  });

  describe('getWindSpeedAnalyticsByDay', () => {
    const mockWindSpeedByDay: WindSpeedAnalyticsByDayResult[] = [
      { date: '2025-11-28', windSpeed: 15.3 },
      { date: '2025-11-27', windSpeed: 12.7 },
      { date: '2025-11-26', windSpeed: 18.1 },
    ];

    it('should call analytics port and return wind speed data by day', async () => {
      analyticsAdapter.setMockWindSpeedByDay(mockWindSpeedByDay);

      const result = await service.getWindSpeedAnalyticsByDay();

      expect(analyticsAdapter.getCallCount('windSpeedByDay')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().windSpeedByDayLimit,
      ).toBeUndefined();
      expect(result).toEqual(mockWindSpeedByDay);
      expect(result).toHaveLength(3);
    });

    it('should pass limit parameter to analytics port', async () => {
      const limit = 10;
      analyticsAdapter.setMockWindSpeedByDay(mockWindSpeedByDay);

      const result = await service.getWindSpeedAnalyticsByDay(limit);

      expect(analyticsAdapter.getLastParams().windSpeedByDayLimit).toBe(limit);
      expect(result).toEqual(mockWindSpeedByDay);
    });

    it('should handle different limit values', async () => {
      analyticsAdapter.setMockWindSpeedByDay(mockWindSpeedByDay);

      await service.getWindSpeedAnalyticsByDay(30);
      expect(analyticsAdapter.getLastParams().windSpeedByDayLimit).toBe(30);

      await service.getWindSpeedAnalyticsByDay(5);
      expect(analyticsAdapter.getLastParams().windSpeedByDayLimit).toBe(5);
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockWindSpeedByDay([]);

      const result = await service.getWindSpeedAnalyticsByDay();

      expect(result).toEqual([]);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailWindSpeedByDay(true);

      await expect(service.getWindSpeedAnalyticsByDay()).rejects.toThrow(
        'InMemory Analytics getWindSpeedAnalyticsByDay failed',
      );
    });
  });

  describe('getComparativeAnalyticsByHour', () => {
    const mockComparativeByHour: ComparativeAnalyticsByHourResult[] = [
      { hour: '00:00', temperature: 20.5, windSpeed: 10.3 },
      { hour: '01:00', temperature: 19.8, windSpeed: 11.5 },
      { hour: '02:00', temperature: 19.2, windSpeed: 12.2 },
    ];

    it('should call analytics port and return comparative data by hour', async () => {
      analyticsAdapter.setMockComparativeByHour(mockComparativeByHour);

      const result = await service.getComparativeAnalyticsByHour();

      expect(analyticsAdapter.getCallCount('comparativeByHour')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().comparativeByHourDate,
      ).toBeUndefined();
      expect(result).toEqual(mockComparativeByHour);
      expect(result).toHaveLength(3);
    });

    it('should pass date parameter to analytics port', async () => {
      const date = '2025-11-28';
      analyticsAdapter.setMockComparativeByHour(mockComparativeByHour);

      const result = await service.getComparativeAnalyticsByHour(date);

      expect(analyticsAdapter.getLastParams().comparativeByHourDate).toBe(date);
      expect(result).toEqual(mockComparativeByHour);
    });

    it('should return data with both temperature and wind speed', async () => {
      analyticsAdapter.setMockComparativeByHour(mockComparativeByHour);

      const result = await service.getComparativeAnalyticsByHour();

      expect(result[0]).toHaveProperty('temperature');
      expect(result[0]).toHaveProperty('windSpeed');
      expect(result[0]).toHaveProperty('hour');
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockComparativeByHour([]);

      const result = await service.getComparativeAnalyticsByHour();

      expect(result).toEqual([]);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailComparativeByHour(true);

      await expect(service.getComparativeAnalyticsByHour()).rejects.toThrow(
        'InMemory Analytics getComparativeAnalyticsByHour failed',
      );
    });
  });

  describe('getComparativeAnalyticsByDay', () => {
    const mockComparativeByDay: ComparativeAnalyticsByDayResult[] = [
      { date: '2025-11-28', temperature: 25.5, windSpeed: 15.3 },
      { date: '2025-11-27', temperature: 24.8, windSpeed: 12.7 },
      { date: '2025-11-26', temperature: 26.2, windSpeed: 18.1 },
    ];

    it('should call analytics port and return comparative data by day', async () => {
      analyticsAdapter.setMockComparativeByDay(mockComparativeByDay);

      const result = await service.getComparativeAnalyticsByDay();

      expect(analyticsAdapter.getCallCount('comparativeByDay')).toBe(1);
      expect(
        analyticsAdapter.getLastParams().comparativeByDayLimit,
      ).toBeUndefined();
      expect(result).toEqual(mockComparativeByDay);
      expect(result).toHaveLength(3);
    });

    it('should pass limit parameter to analytics port', async () => {
      const limit = 14;
      analyticsAdapter.setMockComparativeByDay(mockComparativeByDay);

      const result = await service.getComparativeAnalyticsByDay(limit);

      expect(analyticsAdapter.getLastParams().comparativeByDayLimit).toBe(
        limit,
      );
      expect(result).toEqual(mockComparativeByDay);
    });

    it('should return data with both temperature and wind speed', async () => {
      analyticsAdapter.setMockComparativeByDay(mockComparativeByDay);

      const result = await service.getComparativeAnalyticsByDay();

      expect(result[0]).toHaveProperty('temperature');
      expect(result[0]).toHaveProperty('windSpeed');
      expect(result[0]).toHaveProperty('date');
    });

    it('should handle different limit values', async () => {
      analyticsAdapter.setMockComparativeByDay(mockComparativeByDay);

      await service.getComparativeAnalyticsByDay(7);
      expect(analyticsAdapter.getLastParams().comparativeByDayLimit).toBe(7);

      await service.getComparativeAnalyticsByDay(30);
      expect(analyticsAdapter.getLastParams().comparativeByDayLimit).toBe(30);
    });

    it('should handle empty results', async () => {
      analyticsAdapter.setMockComparativeByDay([]);

      const result = await service.getComparativeAnalyticsByDay();

      expect(result).toEqual([]);
    });

    it('should propagate errors from analytics port', async () => {
      analyticsAdapter.setShouldFailComparativeByDay(true);

      await expect(service.getComparativeAnalyticsByDay()).rejects.toThrow(
        'InMemory Analytics getComparativeAnalyticsByDay failed',
      );
    });
  });
});
