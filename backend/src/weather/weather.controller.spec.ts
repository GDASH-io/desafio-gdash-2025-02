import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherEntity } from './domain/weather.entity';
import { left, right } from '../shared/core/either';
import { Response } from 'express';

const mockWeatherService = {
  createLog: jest.fn(),
  getAllLogs: jest.fn(),
  getInsights: jest.fn(),
};

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a weather log successfully', async () => {
      const dto = {
        city: 'Test City',
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        condition: 'Sunny',
      };
      const log = new WeatherEntity(
        dto.city,
        dto.temperature,
        dto.humidity,
        dto.windSpeed,
        dto.condition,
        new Date(),
        '1',
      );
      
      mockWeatherService.createLog.mockResolvedValue(right(log));

      const result = await controller.createLog(dto);

      expect(result).toBeDefined();
      expect(result.city).toBe(dto.city);
    });

    it('should return error when creation fails', async () => {
      const dto = {
        city: 'Test City',
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        condition: 'Sunny',
      };
      
      mockWeatherService.createLog.mockResolvedValue(left(new Error('Creation failed')));

      const result = await controller.createLog(dto);

      expect(result).toHaveProperty('error');
    });
  });

  describe('getAllLogs', () => {
    it('should return array of weather logs', async () => {
      const logs = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', new Date(), '1'),
        new WeatherEntity('City2', 25, 60, 10, 'Cloudy', new Date(), '2'),
      ];
      
      mockWeatherService.getAllLogs.mockResolvedValue(logs);

      const result = await controller.getAllLogs();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no logs', async () => {
      mockWeatherService.getAllLogs.mockResolvedValue([]);

      const result = await controller.getAllLogs();

      expect(result).toEqual([]);
    });
  });

  describe('getInsights', () => {
    it('should return weather insights', async () => {
      const insights = {
        latestCondition: 'Sunny',
        currentTemp: 25,
        averageTemp: 23.5,
        insight: 'Weather is pleasant',
      };
      
      mockWeatherService.getInsights.mockResolvedValue(insights);

      const result = await controller.getInsights();

      expect(result).toEqual(insights);
    });

    it('should return message when no data available', async () => {
      mockWeatherService.getInsights.mockResolvedValue({
        message: 'No data available for insights.',
      });

      const result = await controller.getInsights();

      expect(result).toHaveProperty('message');
    });
  });

  describe('exportCsv', () => {
    it('should export logs as CSV', async () => {
      const logs = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', new Date('2023-01-01'), '1'),
      ];
      mockWeatherService.getAllLogs.mockResolvedValue(logs);

      const mockResponse = {
        header: jest.fn().mockReturnThis(),
        attachment: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.exportCsv(mockResponse);

      expect(mockResponse.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.attachment).toHaveBeenCalledWith('weather_logs.csv');
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('exportXlsx', () => {
    it('should export logs as XLSX', async () => {
      const logs = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', new Date('2023-01-01'), '1'),
      ];
      mockWeatherService.getAllLogs.mockResolvedValue(logs);

      const mockResponse = {
        header: jest.fn().mockReturnThis(),
        attachment: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.exportXlsx(mockResponse);

      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.attachment).toHaveBeenCalledWith('weather_logs.xlsx');
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});
