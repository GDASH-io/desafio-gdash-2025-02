import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateWeatherDto } from './dto/create-weather.dto';

// Mock do Repositório (Interface)
const mockWeatherRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findLatest: jest.fn(),
  findAllForExport: jest.fn(),
};

// Mock do Cache Manager
const mockCacheManager = {
  clear: jest.fn(),
};

// Mock do ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'GEMINI_API_KEY') return 'fake_api_key';
    return null;
  }),
};

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: 'IWeatherRepository', useValue: mockWeatherRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve salvar log e limpar o cache', async () => {
      const dto: CreateWeatherDto = {
        location_lat: -23.55,
        location_lon: -46.63,
        temperature: 25.5,
        humidity: 60,
        wind_speed: 10,
        condition_code: 1,
        collected_at: new Date().toISOString(),
      };

      // Simula o retorno do repositório
      mockWeatherRepository.create.mockResolvedValue({ _id: '123', ...dto });

      const result = await service.create(dto);

      expect(mockWeatherRepository.create).toHaveBeenCalledWith(dto);
      expect(mockCacheManager.clear).toHaveBeenCalled();
      expect(result).toHaveProperty('_id', '123');
    });
  });

  describe('findAll', () => {
    it('deve retornar dados paginados do repositório', async () => {
      const mockData = [{ temperature: 20 }, { temperature: 21 }];
      const mockTotal = 2;

      mockWeatherRepository.findAll.mockResolvedValue({
        data: mockData,
        total: mockTotal,
      });

      const result = await service.findAll(1, 10);

      expect(mockWeatherRepository.findAll).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 1,
        last_page: 1,
      });
    });
  });

  describe('generateCsv', () => {
    it('deve gerar string CSV se houver dados', async () => {
      const mockData = [
        {
          location_lat: -23,
          location_lon: -46,
          temperature: 25,
          humidity: 50,
          wind_speed: 10,
          condition_code: 1,
          collected_at: '2023-01-01',
        },
      ];
      mockWeatherRepository.findAllForExport.mockResolvedValue(mockData);

      const result = await service.generateCsv();

      expect(mockWeatherRepository.findAllForExport).toHaveBeenCalledWith(2000);

      // CORREÇÃO: Verifica se o cabeçalho e o valor existem, mas não em formato JSON
      expect(result).toContain('temperature'); // Cabeçalho
      expect(result).toContain('25'); // Valor
      expect(typeof result).toBe('string');
    });

    it('deve retornar string vazia se não houver dados', async () => {
      mockWeatherRepository.findAllForExport.mockResolvedValue([]);
      const result = await service.generateCsv();
      expect(result).toBe('');
    });
  });
});
