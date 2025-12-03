import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Model, Connection } from 'mongoose';
import { WeatherStatisticsService } from './services/weather-statistics.service';
import { WeatherInsightsGeneratorService } from './services/weather-insights-generator.service';
import { WeatherExportService } from './services/weather-export.service';
import { LoggerService } from '../common/logger/logger.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let model: Model<WeatherLogDocument>;
  let connection: Connection;

  // Mock do Model como função construtora
  const MockWeatherLogModel: any = jest.fn().mockImplementation((dto) => {
    return {
      ...dto,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: '507f1f77bcf86cd799439011',
      }),
    };
  });

  // Adicionar métodos estáticos ao mock
  MockWeatherLogModel.find = jest.fn();
  MockWeatherLogModel.findOne = jest.fn();
  MockWeatherLogModel.findOneAndUpdate = jest.fn();
  MockWeatherLogModel.create = jest.fn();
  MockWeatherLogModel.countDocuments = jest.fn();

  const mockWeatherLogModel = MockWeatherLogModel;

  const mockConnection = {
    db: {
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
    },
    readyState: 1,
  };

  const mockStatisticsService = {
    getRecentStatistics: jest.fn(),
    getTemperatureTrend: jest.fn(),
  };

  const mockInsightsGenerator = {
    generateInsights: jest.fn(),
  };

  const mockExportService = {
    exportCsv: jest.fn(),
    exportXlsx: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherLogModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: WeatherStatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: WeatherInsightsGeneratorService,
          useValue: mockInsightsGenerator,
        },
        {
          provide: WeatherExportService,
          useValue: mockExportService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    model = module.get<Model<WeatherLogDocument>>(getModelToken(WeatherLog.name));
    connection = module.get<Connection>(getConnectionToken());

    jest.clearAllMocks();
    mockStatisticsService.getRecentStatistics.mockClear();
    mockInsightsGenerator.generateInsights.mockClear();
    mockExportService.exportCsv.mockClear();
    mockExportService.exportXlsx.mockClear();
    MockWeatherLogModel.find.mockClear();
    MockWeatherLogModel.countDocuments.mockClear();
    MockWeatherLogModel.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a weather log', async () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2025-01-24T10:00:00Z',
        temperature: 25.5,
        humidity: 70,
        city: 'São Paulo',
      };

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('_id');
      expect(result.temperature).toBe(25.5);
      expect(result.humidity).toBe(70);
      expect(MockWeatherLogModel).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated results', async () => {
      const query = { page: 1, limit: 10 };
      const mockData = [
        {
          _id: '1',
          timestamp: '2025-01-24T10:00:00Z',
          temperature: 25,
          humidity: 70,
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAllPaginated(query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('totalPages', 1);
      expect(result).toHaveProperty('hasPreviousPage', false);
      expect(result).toHaveProperty('hasNextPage', false);
    });

    it('should filter by city when provided', async () => {
      const query = { page: 1, limit: 10, city: 'São Paulo' };
      const mockData = [];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(0);

      await service.findAllPaginated(query);

      expect(MockWeatherLogModel.find).toHaveBeenCalledWith({
        city: { $regex: 'São Paulo', $options: 'i' },
      });
    });

    it('should handle pagination with multiple pages', async () => {
      const query = { page: 2, limit: 5 };
      const mockData = Array(5).fill(null).map((_, i) => ({
        _id: `${i + 1}`,
        timestamp: `2025-01-24T${10 + i}:00:00Z`,
        temperature: 25 + i,
        humidity: 70 + i,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(15);

      const result = await service.findAllPaginated(query);

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasPreviousPage).toBe(true);
      expect(result.hasNextPage).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return weather logs with default limit', async () => {
      const mockData = Array(100).fill(null).map((_, i) => ({
        _id: `${i + 1}`,
        timestamp: `2025-01-24T${10 + i}:00:00Z`,
        temperature: 25 + i,
        humidity: 70 + i,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(100);

      const result = await service.findAll();

      expect(mockQuery.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(100);
      expect(result).toEqual(mockData);
    });

    it('should return weather logs with custom limit', async () => {
      const limit = 50;
      const mockData = Array(50).fill(null).map((_, i) => ({
        _id: `${i + 1}`,
        timestamp: `2025-01-24T${10 + i}:00:00Z`,
        temperature: 25 + i,
        humidity: 70 + i,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll(limit);

      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(mockData);
    });
  });

  describe('exportCsv', () => {
    it('should delegate to WeatherExportService', async () => {
      const mockCsv = 'timestamp,temperature,humidity,city\n2025-01-24T10:00:00Z,25.5,70,São Paulo';
      mockExportService.exportCsv.mockResolvedValue(mockCsv);

      const result = await service.exportCsv();

      expect(mockExportService.exportCsv).toHaveBeenCalled();
      expect(result).toBe(mockCsv);
    });
  });

  describe('exportXlsx', () => {
    it('should delegate to WeatherExportService', async () => {
      const mockWorkbook = {
        worksheets: [{ name: 'Weather Logs' }],
      };
      mockExportService.exportXlsx.mockResolvedValue(mockWorkbook);

      const result = await service.exportXlsx();

      expect(mockExportService.exportXlsx).toHaveBeenCalled();
      expect(result).toBe(mockWorkbook);
    });
  });

  describe('getInsights', () => {
    it('should delegate to WeatherInsightsGeneratorService', async () => {
      const mockInsights = {
        summary: 'Test summary',
        statistics: {
          averageTemperature: 25,
          averageHumidity: 70,
          maxTemperature: 30,
          minTemperature: 20,
          maxHumidity: 80,
          minHumidity: 60,
          temperatureTrend: 'estável',
        },
        comfortScore: 85,
        dayClassification: 'agradável',
        alerts: ['Nenhum alerta no momento'],
        dataPoints: 30,
      };

      mockInsightsGenerator.generateInsights.mockResolvedValue(mockInsights);

      const result = await service.getInsights();

      expect(mockInsightsGenerator.generateInsights).toHaveBeenCalledWith(30);
      expect(result).toEqual(mockInsights);
    });

    it('should return message when no logs available', async () => {
      const error = new Error('Dados insuficientes para gerar insights');
      mockInsightsGenerator.generateInsights.mockRejectedValue(error);

      const result = await service.getInsights();

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Dados insuficientes');
    });

    it('should return message when no logs available with city', async () => {
      const error = new Error('Dados insuficientes para gerar insights');
      mockInsightsGenerator.generateInsights.mockRejectedValue(error);

      const result = await service.getInsights('São Paulo');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Dados insuficientes');
      expect(result.summary).toContain('São Paulo');
    });

    it('should pass city parameter when provided', async () => {
      const mockInsights = {
        summary: 'Test summary',
        statistics: {
          averageTemperature: 25,
          averageHumidity: 70,
          maxTemperature: 30,
          minTemperature: 20,
          maxHumidity: 80,
          minHumidity: 60,
          temperatureTrend: 'estável',
        },
        comfortScore: 85,
        dayClassification: 'agradável',
        alerts: ['Nenhum alerta no momento'],
        dataPoints: 30,
      };

      mockInsightsGenerator.generateInsights.mockResolvedValue(mockInsights);

      const result = await service.getInsights('São Paulo');

      expect(mockInsightsGenerator.generateInsights).toHaveBeenCalledWith(30, 'São Paulo');
      expect(result).toEqual(mockInsights);
    });

    it('should throw error for non-insufficient-data errors', async () => {
      const error = new Error('Database connection failed');
      mockInsightsGenerator.generateInsights.mockRejectedValue(error);

      await expect(service.getInsights()).rejects.toThrow('Database connection failed');
    });

    it('should throw error for non-insufficient-data errors with city', async () => {
      const error = new Error('Database connection failed');
      mockInsightsGenerator.generateInsights.mockRejectedValue(error);

      await expect(service.getInsights('São Paulo')).rejects.toThrow('Database connection failed');
    });
  });

  describe('getAvailableCities', () => {
    it('should return available cities', async () => {
      const mockCities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
      MockWeatherLogModel.distinct = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCities),
      });

      const result = await service.getAvailableCities();

      expect(MockWeatherLogModel.distinct).toHaveBeenCalledWith('city');
      expect(result).toEqual(mockCities.sort());
    });

    it('should filter out null/undefined cities', async () => {
      const mockCities = ['São Paulo', null, 'Rio de Janeiro', undefined, 'Belo Horizonte'];
      MockWeatherLogModel.distinct = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCities),
      });

      const result = await service.getAvailableCities();

      expect(result).not.toContain(null);
      expect(result).not.toContain(undefined);
      expect(result.length).toBe(3);
    });
  });

  describe('exportCsv error handling', () => {
    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      mockExportService.exportCsv.mockRejectedValue(error);

      await expect(service.exportCsv()).rejects.toThrow('Export failed');
    });
  });

  describe('exportXlsx error handling', () => {
    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      mockExportService.exportXlsx.mockRejectedValue(error);

      await expect(service.exportXlsx()).rejects.toThrow('Export failed');
    });
  });

  describe('findAllPaginated with date filters', () => {
    it('should filter by startDate', async () => {
      const query = {
        page: 1,
        limit: 10,
        startDate: '2025-01-01T00:00:00Z',
      };
      const mockData = [];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(0);

      await service.findAllPaginated(query);

      expect(MockWeatherLogModel.find).toHaveBeenCalledWith({
        timestamp: { $gte: '2025-01-01T00:00:00Z' },
      });
    });

    it('should filter by endDate', async () => {
      const query = {
        page: 1,
        limit: 10,
        endDate: '2025-01-31T23:59:59Z',
      };
      const mockData = [];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(0);

      await service.findAllPaginated(query);

      expect(MockWeatherLogModel.find).toHaveBeenCalledWith({
        timestamp: { $lte: '2025-01-31T23:59:59Z' },
      });
    });

    it('should filter by both startDate and endDate', async () => {
      const query = {
        page: 1,
        limit: 10,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };
      const mockData = [];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(0);

      await service.findAllPaginated(query);

      expect(MockWeatherLogModel.find).toHaveBeenCalledWith({
        timestamp: {
          $gte: '2025-01-01T00:00:00Z',
          $lte: '2025-01-31T23:59:59Z',
        },
      });
    });

    it('should filter by city and date range', async () => {
      const query = {
        page: 1,
        limit: 10,
        city: 'São Paulo',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };
      const mockData = [];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.countDocuments.mockResolvedValue(0);

      await service.findAllPaginated(query);

      expect(MockWeatherLogModel.find).toHaveBeenCalledWith({
        city: { $regex: 'São Paulo', $options: 'i' },
        timestamp: {
          $gte: '2025-01-01T00:00:00Z',
          $lte: '2025-01-31T23:59:59Z',
        },
      });
    });
  });

  describe('findAll error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });

    it('should handle error when getting collection info', async () => {
      const mockLogs = Array(100).fill(null).map((_, i) => ({
        _id: `${i + 1}`,
        timestamp: `2025-01-24T${10 + i}:00:00Z`,
        temperature: 25 + i,
        humidity: 70 + i,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.collection = {
        name: 'weatherlogs',
      };
      MockWeatherLogModel.countDocuments = jest.fn().mockRejectedValue(new Error('Collection error'));

      const result = await service.findAll();

      expect(result).toEqual(mockLogs);
    });

    it('should handle null db in connection', async () => {
      const mockLogs = Array(100).fill(null).map((_, i) => ({
        _id: `${i + 1}`,
        timestamp: `2025-01-24T${10 + i}:00:00Z`,
        temperature: 25 + i,
        humidity: 70 + i,
      }));

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);
      MockWeatherLogModel.collection = {
        name: 'weatherlogs',
      };
      MockWeatherLogModel.countDocuments = jest.fn().mockResolvedValue(100);
      
      // Simular db null
      const originalDb = mockConnection.db;
      mockConnection.db = null as any;

      const result = await service.findAll();

      expect(result).toEqual(mockLogs);
      
      // Restaurar db
      mockConnection.db = originalDb;
    });
  });

  describe('findAllPaginated error handling', () => {
    it('should handle database errors', async () => {
      const query = { page: 1, limit: 10 };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      MockWeatherLogModel.find.mockReturnValue(mockQuery);

      await expect(service.findAllPaginated(query)).rejects.toThrow('Database error');
    });
  });
});

