import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { IWeatherRepository } from './domain/weather.repository.interface';
import { WeatherEntity } from './domain/weather.entity';

const mockWeatherRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('WeatherService', () => {
  let service: WeatherService;
  let repository: IWeatherRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: IWeatherRepository,
          useValue: mockWeatherRepository,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    repository = module.get<IWeatherRepository>(IWeatherRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should return Right with created log', async () => {
      const dto = { city: 'Test City', temperature: 25, humidity: 50, windSpeed: 10, condition: 'Clear' };
      mockWeatherRepository.create.mockResolvedValue(new WeatherEntity(dto.city, dto.temperature, dto.humidity, dto.windSpeed, dto.condition, new Date()));

      const result = await service.createLog(dto);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeInstanceOf(WeatherEntity);
    });

    it('should handle negative temperature', async () => {
      const dto = { city: 'Arctic', temperature: -40, humidity: 80, windSpeed: 20, condition: 'Snow' };
      mockWeatherRepository.create.mockResolvedValue(new WeatherEntity(dto.city, dto.temperature, dto.humidity, dto.windSpeed, dto.condition, new Date()));

      const result = await service.createLog(dto);

      expect(result.isRight()).toBe(true);
      expect(result.value.temperature).toBe(-40);
    });

    it('should handle extreme temperature', async () => {
      const dto = { city: 'Desert', temperature: 55, humidity: 10, windSpeed: 5, condition: 'Extreme Heat' };
      mockWeatherRepository.create.mockResolvedValue(new WeatherEntity(dto.city, dto.temperature, dto.humidity, dto.windSpeed, dto.condition, new Date()));

      const result = await service.createLog(dto);

      expect(result.isRight()).toBe(true);
    });

    it('should handle zero values', async () => {
      const dto = { city: 'Calm', temperature: 0, humidity: 0, windSpeed: 0, condition: 'Calm' };
      mockWeatherRepository.create.mockResolvedValue(new WeatherEntity(dto.city, dto.temperature, dto.humidity, dto.windSpeed, dto.condition, new Date()));

      const result = await service.createLog(dto);

      expect(result.isRight()).toBe(true);
    });

    it('should handle very long city name', async () => {
      const dto = { city: 'A'.repeat(200), temperature: 20, humidity: 50, windSpeed: 10, condition: 'Clear' };
      mockWeatherRepository.create.mockResolvedValue(new WeatherEntity(dto.city, dto.temperature, dto.humidity, dto.windSpeed, dto.condition, new Date()));

      const result = await service.createLog(dto);

      expect(result.isRight()).toBe(true);
    });
  });

  describe('getAllLogs', () => {
    it('should return array of logs', async () => {
      const logs = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', new Date(), '1'),
        new WeatherEntity('City2', 25, 60, 10, 'Cloudy', new Date(), '2'),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getAllLogs();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no logs', async () => {
      mockWeatherRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllLogs();

      expect(result).toEqual([]);
    });

    it('should handle large dataset', async () => {
      const logs = Array.from({ length: 10000 }, (_, i) => 
        new WeatherEntity(`City${i}`, 20 + i % 30, 50, 10, 'Clear', new Date(), `${i}`)
      );
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getAllLogs();

      expect(result).toHaveLength(10000);
    });
  });

  describe('getInsights', () => {
    it('should return default message if no logs', async () => {
      mockWeatherRepository.findAll.mockResolvedValue([]);
      const result = await service.getInsights();
      expect(result.message).toBe('No data available for insights.');
    });

    it('should return insights for hot weather', async () => {
      const logs = [
        new WeatherEntity('City', 35, 50, 10, 'Clear', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.insight).toContain('very hot');
    });

    it('should return insights for cold weather', async () => {
      const logs = [
        new WeatherEntity('City', 10, 50, 10, 'Clear', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.insight).toContain('cold');
    });

    it('should return insights for rainy weather', async () => {
      const logs = [
        new WeatherEntity('City', 20, 80, 15, 'Rain', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.insight).toContain('rain');
    });

    it('should calculate average temperature correctly', async () => {
      const logs = [
        new WeatherEntity('City', 20, 50, 10, 'Clear', new Date()),
        new WeatherEntity('City', 30, 50, 10, 'Clear', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.averageTemp).toBe(25);
    });

    it('should handle single log', async () => {
      const logs = [
        new WeatherEntity('City', 25, 50, 10, 'Clear', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.averageTemp).toBe(25);
      expect(result.currentTemp).toBe(25);
    });

    it('should return stable conditions for moderate weather', async () => {
      const logs = [
        new WeatherEntity('City', 20, 50, 10, 'Clear', new Date()),
      ];
      mockWeatherRepository.findAll.mockResolvedValue(logs);

      const result = await service.getInsights();
      expect(result.insight).toContain('stable');
    });
  });
});
