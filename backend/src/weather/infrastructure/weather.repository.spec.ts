import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherRepository } from './weather.repository';
import { WeatherLog } from '../schemas/weather-log.schema';
import { WeatherEntity } from '../domain/weather.entity';

const mockWeatherLogModel = {
  new: jest.fn(),
  constructor: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  sort: jest.fn(),
  exec: jest.fn(),
};

describe('WeatherRepository', () => {
  let repository: WeatherRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherRepository,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherLogModel,
        },
      ],
    }).compile();

    repository = module.get<WeatherRepository>(WeatherRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of weather logs sorted by timestamp', async () => {
      const mockLogs = [
        {
          _id: '1',
          city: 'City1',
          temperature: 20,
          humidity: 50,
          windSpeed: 5,
          condition: 'Clear',
          timestamp: new Date(),
        },
        {
          _id: '2',
          city: 'City2',
          temperature: 25,
          humidity: 60,
          windSpeed: 10,
          condition: 'Cloudy',
          timestamp: new Date(),
        },
      ];
      
      mockWeatherLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLogs),
        }),
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(WeatherEntity);
    });

    it('should return empty array when no logs', async () => {
      mockWeatherLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });
});
