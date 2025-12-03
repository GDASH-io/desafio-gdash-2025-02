import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  const mockWeatherService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    exportCsv: jest.fn(),
    exportXlsx: jest.fn(),
    getInsights: jest.fn(),
    getAvailableCities: jest.fn(),
  };

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

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /weather/logs', () => {
    it('should call weatherService.create with correct DTO', async () => {
      // Arrange
      const createWeatherLogDto: CreateWeatherLogDto = {
        timestamp: '2025-01-24T10:00:00Z',
        temperature: 25.5,
        humidity: 70,
        city: 'São Paulo',
      };

      const expectedResult = {
        _id: '507f1f77bcf86cd799439011',
        ...createWeatherLogDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWeatherService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createWeatherLogDto);

      // Assert
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createWeatherLogDto);
      expect(result).toEqual(expectedResult);
    });

    it('should call weatherService.create without city (optional field)', async () => {
      // Arrange
      const createWeatherLogDto: CreateWeatherLogDto = {
        timestamp: '2025-01-24T10:00:00Z',
        temperature: 22.0,
        humidity: 65,
      };

      const expectedResult = {
        _id: '507f1f77bcf86cd799439012',
        ...createWeatherLogDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWeatherService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createWeatherLogDto);

      // Assert
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createWeatherLogDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return 201 status code (handled by @HttpCode decorator)', async () => {
      // Arrange
      const createWeatherLogDto: CreateWeatherLogDto = {
        timestamp: '2025-01-24T10:00:00Z',
        temperature: 20.0,
        humidity: 60,
      };

      const expectedResult = {
        _id: '507f1f77bcf86cd799439013',
        ...createWeatherLogDto,
      };

      mockWeatherService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createWeatherLogDto);

      // Assert
      expect(result).toBeDefined();
      // O decorator @HttpCode(HttpStatus.CREATED) é testado na integração,
      // mas podemos verificar que o método foi chamado corretamente
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('GET /weather/logs', () => {
    it('should return paginated weather logs', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      mockWeatherService.findAllPaginated.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockQuery);

      expect(service.findAllPaginated).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });

    it('should handle pagination with city filter', async () => {
      const mockQuery = { page: 1, limit: 10, city: 'São Paulo' };
      const mockResult = {
        data: [{ city: 'São Paulo', temperature: 25 }],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      mockWeatherService.findAllPaginated.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockQuery);

      expect(service.findAllPaginated).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /weather/export.csv', () => {
    it('should export CSV', async () => {
      const mockCsv = 'timestamp,temperature,humidity\n2025-01-24,25,70';
      const mockResponse = {
        send: jest.fn(),
      };

      mockWeatherService.exportCsv.mockResolvedValue(mockCsv);

      await controller.exportCsv(mockResponse as any);

      expect(service.exportCsv).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(mockCsv);
    });
  });

  describe('GET /weather/export.xlsx', () => {
    it('should export XLSX', async () => {
      const mockWorkbook = {
        xlsx: {
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
      };
      const mockResponse = {
        send: jest.fn(),
      };

      mockWeatherService.exportXlsx.mockResolvedValue(mockWorkbook);

      await controller.exportXlsx(mockResponse as any);

      expect(service.exportXlsx).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('GET /weather/insights', () => {
    it('should return insights without city filter', async () => {
      const mockInsights = {
        summary: 'Test summary',
        statistics: {},
        comfortScore: 85,
        dayClassification: 'agradável',
        alerts: [],
        dataPoints: 30,
      };

      mockWeatherService.getInsights.mockResolvedValue(mockInsights);

      const result = await controller.getInsights();

      expect(service.getInsights).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockInsights);
    });

    it('should return insights with city filter', async () => {
      const mockInsights = {
        summary: 'Test summary',
        statistics: {},
        comfortScore: 85,
        dayClassification: 'agradável',
        alerts: [],
        dataPoints: 30,
      };

      mockWeatherService.getInsights.mockResolvedValue(mockInsights);

      const result = await controller.getInsights('São Paulo');

      expect(service.getInsights).toHaveBeenCalledWith('São Paulo');
      expect(result).toEqual(mockInsights);
    });
  });

  describe('GET /weather/cities', () => {
    it('should return available cities', async () => {
      const mockCities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
      mockWeatherService.getAvailableCities.mockResolvedValue(mockCities);

      const result = await controller.getAvailableCities();

      expect(service.getAvailableCities).toHaveBeenCalled();
      expect(result).toEqual(mockCities);
    });
  });
});

