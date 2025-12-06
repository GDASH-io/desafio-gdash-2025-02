import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherLog } from './schema/weather-log.schema';

describe('WeatherService', () => {
  let service: WeatherService;
  let weatherModel: any;

  // Mock de dados climáticos
  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    timestamp: new Date('2025-12-01T15:00:00Z'),
    location: {
      name: 'Florianópolis',
      latitude: -27.5935,
      longitude: -48.5589,
    },
    temperature: 28.5,
    humidity: 75,
    windSpeed: 12.3,
    condition: 'clear',
    rainProbability: 10,
    feelsLike: 29.0,
    pressure: 1013,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockWeatherModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }));
  
  Object.assign(mockWeatherModel, {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    weatherModel = module.get(getModelToken(WeatherLog.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // TESTE 1: Service está definido
  // ==========================================
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // TESTE 2: Criar log de clima
  // ==========================================
  describe('create', () => {
    it('should create weather log successfully', async () => {
      const dto = {
        timestamp: new Date('2025-12-01T15:00:00Z'),
        location: {
          name: 'Florianópolis',
          latitude: -27.5935,
          longitude: -48.5589,
        },
        temperature: 28.5,
        humidity: 75,
        windSpeed: 12.3,
        condition: 'clear',
        rainProbability: 10,
      };

      const result = await service.create(dto as any);

      expect(result).toBeDefined();
      expect(result.temperature).toBe(dto.temperature);
    });
  });

  // ==========================================
  // TESTE 3: Listar com paginação
  // ==========================================
  describe('findAll', () => {
    it('should return paginated weather logs', async () => {
      const mockData = [mockWeatherLog];
      const mockTotal = 1;

      mockWeatherModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockData),
            }),
          }),
        }),
      });

      mockWeatherModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(1, 50);

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(mockTotal);
      expect(mockWeatherModel.find).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTE 4: Buscar registros mais recentes
  // ==========================================
  describe('getLatest', () => {
    it('should return latest weather logs', async () => {
      const mockLogs = [mockWeatherLog, mockWeatherLog];

      mockWeatherModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      const result = await service.getLatest(10);

      expect(result).toEqual(mockLogs);
      expect(result.length).toBe(2);
    });
  });

  // ==========================================
  // TESTE 5: Calcular estatísticas
  // ==========================================
  describe('getStats', () => {
    it('should calculate statistics correctly', async () => {
      const mockLogs = [
        { temperature: 25, humidity: 70, windSpeed: 10 },
        { temperature: 30, humidity: 80, windSpeed: 15 },
        { temperature: 28, humidity: 75, windSpeed: 12 },
      ];

      mockWeatherModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLogs),
      });

      const result = await service.getStats();

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.totalRecords).toBe(3);
      expect(result!.temperature.avg).toBeCloseTo(27.67, 1);
      expect(result!.temperature.min).toBe(25);
      expect(result!.temperature.max).toBe(30);
      expect(result!.humidity.avg).toBeCloseTo(75, 0);
      expect(result!.windSpeed.avg).toBeCloseTo(12.33, 1);
    });

    it('should return null if no data exists', async () => {
      mockWeatherModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getStats();

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // TESTE 6: Buscar por intervalo de datas
  // ==========================================
  describe('findByDateRange', () => {
    it('should return logs within date range', async () => {
      const startDate = new Date('2025-12-01T00:00:00Z');
      const endDate = new Date('2025-12-01T23:59:59Z');
      const mockLogs = [mockWeatherLog];

      mockWeatherModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLogs),
        }),
      });

      const result = await service.findByDateRange(startDate, endDate);

      expect(result).toEqual(mockLogs);
      expect(mockWeatherModel.find).toHaveBeenCalledWith({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    });
  });

  // ==========================================
  // TESTE 7: Buscar por ID
  // ==========================================
  describe('findOne', () => {
    it('should return weather log by id', async () => {
      mockWeatherModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWeatherLog),
      });

      const result = await service.findOne('123');

      expect(result).toEqual(mockWeatherLog);
      expect(mockWeatherModel.findById).toHaveBeenCalledWith('123');
    });
  });
});