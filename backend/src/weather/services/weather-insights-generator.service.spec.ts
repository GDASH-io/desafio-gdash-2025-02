import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherInsightsGeneratorService } from './weather-insights-generator.service';
import { WeatherStatisticsService } from './weather-statistics.service';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import { Model } from 'mongoose';

describe('WeatherInsightsGeneratorService', () => {
  let service: WeatherInsightsGeneratorService;
  let model: Model<WeatherLogDocument>;
  let statisticsService: WeatherStatisticsService;

  const mockWeatherLogModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  };

  const mockStatisticsService = {
    getRecentStatistics: jest.fn(),
    getTemperatureTrend: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherInsightsGeneratorService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherLogModel,
        },
        {
          provide: WeatherStatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    service = module.get<WeatherInsightsGeneratorService>(WeatherInsightsGeneratorService);
    model = module.get<Model<WeatherLogDocument>>(getModelToken(WeatherLog.name));
    statisticsService = module.get<WeatherStatisticsService>(WeatherStatisticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInsights', () => {
    it('should generate insights without city filter', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70, timestamp: '2025-01-01' },
        { temperature: 26, humidity: 75, timestamp: '2025-01-02' },
      ];

      mockWeatherLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      mockStatisticsService.getRecentStatistics.mockResolvedValue({
        averageTemperature: 25.5,
        averageHumidity: 72.5,
        maxTemperature: 26,
        minTemperature: 25,
        maxHumidity: 75,
        minHumidity: 70,
      });
      mockStatisticsService.getTemperatureTrend.mockResolvedValue('estável');

      const result = await service.generateInsights(30, undefined);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('comfortScore');
      expect(result).toHaveProperty('dayClassification');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('dataPoints');
    });

    it('should generate insights with city filter', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70, city: 'São Paulo', timestamp: '2025-01-01' },
      ];

      mockWeatherLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      mockStatisticsService.getRecentStatistics.mockResolvedValue({
        averageTemperature: 25,
        averageHumidity: 70,
        maxTemperature: 25,
        minTemperature: 25,
        maxHumidity: 70,
        minHumidity: 70,
      });
      mockStatisticsService.getTemperatureTrend.mockResolvedValue('estável');

      const result = await service.generateInsights(30, 'São Paulo');

      expect(result).toHaveProperty('summary');
      expect(result.dataPoints).toBe(1);
    });

    it('should handle empty logs', async () => {
      mockWeatherLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.generateInsights(30)).rejects.toThrow('Dados insuficientes');
    });
  });
});

