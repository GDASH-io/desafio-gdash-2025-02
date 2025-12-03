import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherStatisticsService } from './weather-statistics.service';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import { Model } from 'mongoose';

describe('WeatherStatisticsService', () => {
  let service: WeatherStatisticsService;
  let model: Model<WeatherLogDocument>;

  const mockWeatherLogModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherStatisticsService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherLogModel,
        },
      ],
    }).compile();

    service = module.get<WeatherStatisticsService>(WeatherStatisticsService);
    model = module.get<Model<WeatherLogDocument>>(getModelToken(WeatherLog.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecentStatistics', () => {
    it('should calculate statistics from recent logs', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70 },
        { temperature: 26, humidity: 65 },
        { temperature: 24, humidity: 75 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getRecentStatistics(30);

      expect(result).toHaveProperty('averageTemperature');
      expect(result).toHaveProperty('averageHumidity');
      expect(result).toHaveProperty('maxTemperature');
      expect(result).toHaveProperty('minTemperature');
      expect(result.averageTemperature).toBe(25);
      expect(result.maxTemperature).toBe(26);
      expect(result.minTemperature).toBe(24);
    });

    it('should return zeros when no logs available', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getRecentStatistics(30);

      expect(result.averageTemperature).toBe(0);
      expect(result.averageHumidity).toBe(0);
    });

    it('should filter by city when provided', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70, city: 'São Paulo' },
        { temperature: 26, humidity: 65, city: 'São Paulo' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getRecentStatistics(30, 'São Paulo');

      expect(mockWeatherLogModel.find).toHaveBeenCalled();
      expect(result.averageTemperature).toBe(25.5);
    });
  });

  describe('getTemperatureTrend', () => {
    it('should filter by city when provided', async () => {
      const mockLogs = Array(30)
        .fill(null)
        .map((_, i) => ({
          temperature: 20 + i,
          humidity: 70,
          city: 'São Paulo',
        }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getTemperatureTrend(30, 'São Paulo');

      expect(mockWeatherLogModel.find).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should detect rising trend', async () => {
      // Array ordenado por timestamp DESC (mais recentes primeiro)
      // Para detectar tendência de subida, os últimos 10 devem ser maiores que os anteriores 10
      const mockLogs = Array(30)
        .fill(null)
        .map((_, i) => ({
          temperature: 30 - i * 0.5, // Temperatura descendo no array (mais recente = maior)
          humidity: 70,
        }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getTemperatureTrend(30);

      // last10 = [30, 29.5, ..., 25.5] (média ~27.75)
      // previous10 = [25, 24.5, ..., 20.5] (média ~22.75)
      // Como last10 > previous10, tendência é "subindo"
      expect(result).toBe('subindo');
    });

    it('should detect stable trend with few data points', async () => {
      const mockLogs = Array(10).fill(null).map(() => ({
        temperature: 25,
        humidity: 70,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getTemperatureTrend(30);

      expect(result).toBe('estável');
    });

    it('should not filter by city when city is not provided', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70 },
        { temperature: 26, humidity: 65 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      await service.getTemperatureTrend(30);

      expect(mockWeatherLogModel.find).toHaveBeenCalledWith({});
    });

    it('should not filter by city when city is not provided in getRecentStatistics', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70 },
        { temperature: 26, humidity: 65 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      await service.getRecentStatistics(30);

      expect(mockWeatherLogModel.find).toHaveBeenCalledWith({});
    });

    it('should not filter by city when city is undefined in getRecentStatistics', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70 },
        { temperature: 26, humidity: 65 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      await service.getRecentStatistics(30, undefined);

      // Quando city é undefined, não deve filtrar
      expect(mockWeatherLogModel.find).toHaveBeenCalledWith({});
    });

    it('should not filter by city when city is undefined in getTemperatureTrend', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70 },
        { temperature: 26, humidity: 65 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      await service.getTemperatureTrend(30, undefined);

      // Quando city é undefined, não deve filtrar
      expect(mockWeatherLogModel.find).toHaveBeenCalledWith({});
    });

    it('should detect falling trend', async () => {
      // Array ordenado por timestamp DESC (mais recentes primeiro)
      // Para detectar tendência de queda, os últimos 10 devem ser menores que os anteriores 10
      const mockLogs = Array(30)
        .fill(null)
        .map((_, i) => ({
          temperature: 20 + i * 0.5, // Temperatura subindo no array (mais recente = menor)
          humidity: 70,
        }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getTemperatureTrend(30);

      // last10 = [20, 20.5, ..., 24.5] (média ~22.25)
      // previous10 = [25, 25.5, ..., 29.5] (média ~27.25)
      // Como last10 < previous10, tendência é "caindo"
      expect(result).toBe('caindo');
    });

    it('should handle empty temperature array', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.getTemperatureTrend(30);

      expect(result).toBe('estável');
    });
  });
});

