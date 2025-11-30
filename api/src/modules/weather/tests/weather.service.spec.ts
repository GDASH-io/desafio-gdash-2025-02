import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { AiService } from '../../ai/ai.service';
import { SpreadsheetService } from '../../spreadsheet/spreadsheet.service';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import { InMemoryWeatherRepository } from '../infraestructure/adapters/inmemory-weather.repository';
import { WeatherService } from '../weather.service';

jest.mock('@toon-format/toon', () => ({
  encode: jest.fn(() => 'mocked-encoded-string'),
}));

describe('WeatherService', () => {
  let service: WeatherService;
  let repository: InMemoryWeatherRepository;
  let aiService: jest.Mocked<AiService>;
  let spreadsheetService: jest.Mocked<SpreadsheetService>;

  const mockWeatherData: CreateWeatherDto = {
    latitude: -23.55,
    longitude: -46.63,
    generationtime_ms: 0.5,
    utc_offset_seconds: -10800,
    timezone: 'America/Sao_Paulo',
    timezone_abbreviation: 'BRT',
    elevation: 760,
    current_units: {
      time: 'iso8601',
      interval: 'seconds',
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      precipitation_probability: '%',
      precipitation: 'mm',
      rain: 'mm',
      weather_code: 'wmo code',
      pressure_msl: 'hPa',
      cloud_cover: '%',
      visibility: 'm',
      evapotranspiration: 'mm',
      et0_fao_evapotranspiration: 'mm',
      wind_speed_10m: 'km/h',
      wind_speed_80m: 'km/h',
      wind_speed_120m: 'km/h',
      wind_direction_10m: '°',
      wind_direction_80m: '°',
      wind_direction_120m: '°',
      wind_speed_180m: 'km/h',
      wind_direction_180m: '°',
      wind_gusts_10m: 'km/h',
      temperature_80m: '°C',
      temperature_120m: '°C',
      temperature_180m: '°C',
      is_day: '',
      uv_index: '',
      uv_index_clear_sky: '',
      direct_radiation: 'W/m²',
    },
    current: {
      time: '2025-11-28T10:00',
      interval: 900,
      temperature_2m: 25.5,
      relative_humidity_2m: 65,
      precipitation_probability: 10,
      precipitation: 0,
      rain: 0,
      weather_code: 1,
      pressure_msl: 1013.2,
      cloud_cover: 20,
      visibility: 10000,
      evapotranspiration: 0.5,
      et0_fao_evapotranspiration: 0.3,
      wind_speed_10m: 15,
      wind_speed_80m: 20,
      wind_speed_120m: 25,
      wind_direction_10m: 180,
      wind_direction_80m: 185,
      wind_direction_120m: 190,
      wind_speed_180m: 30,
      wind_direction_180m: 195,
      wind_gusts_10m: 25,
      temperature_80m: 24,
      temperature_120m: 23,
      temperature_180m: 22,
      is_day: 1,
      uv_index: 5,
      uv_index_clear_sky: 6,
      direct_radiation: 500,
    },
  };

  const mockInsight = {
    description: 'Clima agradável',
    activities: ['Caminhada', 'Ciclismo', 'Leitura'],
  };

  const mockEmbedding = [0.1, 0.2, 0.3, 0.4];

  beforeEach(async () => {
    repository = new InMemoryWeatherRepository();

    const mockAiService = {
      getInsightsFromData: jest.fn(),
      generateEmbedding: jest.fn(),
    };

    const mockSpreadsheetService = {
      generateCsv: jest.fn(),
      generateXlsx: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: commonConstants.ports.WEATHER,
          useValue: repository,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: SpreadsheetService,
          useValue: mockSpreadsheetService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    aiService = module.get(AiService);
    spreadsheetService = module.get(SpreadsheetService);
  });

  afterEach(() => {
    repository.clear();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new weather document when none exists', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);

      const allWeathers = repository.getAll();
      expect(allWeathers).toHaveLength(1);
      expect(allWeathers[0].insight).toEqual(mockInsight);
      expect(allWeathers[0].embedding).toEqual(mockEmbedding);
      expect(aiService.getInsightsFromData).toHaveBeenCalled();
      expect(aiService.generateEmbedding).toHaveBeenCalled();
    });

    it('should update existing weather document', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);
      await service.create(mockWeatherData);

      const allWeathers = repository.getAll();
      expect(allWeathers).toHaveLength(1);
      expect(allWeathers[0].data).toHaveLength(2);
    });
  });

  describe('getWeathers', () => {
    it('should return weather data for today', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);

      const result = await service.getWeathers();

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when no data exists', async () => {
      await expect(service.getWeathers()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllWeathers', () => {
    it('should return all weather documents', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);

      const result = await service.getAllWeathers();

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should return limited weather documents', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);

      const result = await service.getAllWeathers(1);

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when no data exists', async () => {
      await expect(service.getAllWeathers()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWeather', () => {
    it('should return single weather data with insight', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);

      await service.create(mockWeatherData);

      const result = await service.getWeather();

      expect(result.data).toBeDefined();
      expect(result.insight).toEqual(mockInsight);
    });

    it('should throw NotFoundException when no data exists', async () => {
      await expect(service.getWeather()).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToCsv', () => {
    it('should export weather data to CSV', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);
      spreadsheetService.generateCsv.mockReturnValue('csv,data');

      await service.create(mockWeatherData);
      const result = await service.exportToCsv();

      expect(result).toBe('csv,data');
      expect(spreadsheetService.generateCsv).toHaveBeenCalled();
    });
  });

  describe('exportToXlsx', () => {
    it('should export weather data to XLSX', async () => {
      aiService.getInsightsFromData.mockResolvedValue(mockInsight);
      aiService.generateEmbedding.mockResolvedValue(mockEmbedding);
      const mockBuffer = Buffer.from('xlsx data');
      spreadsheetService.generateXlsx.mockResolvedValue(mockBuffer);

      await service.create(mockWeatherData);
      const result = await service.exportToXlsx();

      expect(result).toEqual(mockBuffer);
      expect(spreadsheetService.generateXlsx).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no data to export', async () => {
      await expect(service.exportToXlsx()).rejects.toThrow(NotFoundException);
    });
  });
});
