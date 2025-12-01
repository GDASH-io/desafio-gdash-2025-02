import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { Insight, InsightType, InsightSeverity } from './schemas/insight.schema';
import { WeatherService } from '../weather/weather.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let weatherService: WeatherService;
  let insightModel: any;

  // Mock de dados climáticos para análise
  const mockWeatherLogs = [
    {
      timestamp: new Date('2025-12-01T12:00:00Z'),
      temperature: 28.5,
      humidity: 75,
      windSpeed: 12.3,
      condition: 'clear',
      rainProbability: 10,
    },
    {
      timestamp: new Date('2025-12-01T15:00:00Z'),
      temperature: 30.2,
      humidity: 80,
      windSpeed: 15.0,
      condition: 'cloudy',
      rainProbability: 40,
    },
    {
      timestamp: new Date('2025-12-01T18:00:00Z'),
      temperature: 27.8,
      humidity: 78,
      windSpeed: 10.5,
      condition: 'partly_cloudy',
      rainProbability: 25,
    },
  ];

  // Mock de insight gerado
  const mockInsight = {
    _id: '507f1f77bcf86cd799439011',
    type: InsightType.SUMMARY,
    title: 'Resumo dos Últimos Dias',
    content: 'Temperatura média 28.8°C...',
    severity: InsightSeverity.INFO,
    metadata: {
      avgTemperature: 28.8,
      avgHumidity: 77.7,
      dataPointsAnalyzed: 3,
    },
    generatedAt: new Date(),
  };

  const mockInsightModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: '507f1f77bcf86cd799439011',
    generatedAt: new Date(),
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: '507f1f77bcf86cd799439011',
      generatedAt: new Date(),
    }),
  }));
  
  Object.assign(mockInsightModel, {
    find: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  });

  const mockWeatherService = {
    findByDateRange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: getModelToken(Insight.name),
          useValue: mockInsightModel,
        },
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    weatherService = module.get<WeatherService>(WeatherService);
    insightModel = module.get(getModelToken(Insight.name));
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
  // TESTE 2: Gerar insights com sucesso
  // ==========================================
  describe('generateInsights', () => {
    it('should generate insights from weather data', async () => {
      // Mock: WeatherService retorna dados
      mockWeatherService.findByDateRange.mockResolvedValue(mockWeatherLogs);

      // Mock: Salvar insights no banco
      mockInsightModel.insertMany.mockResolvedValue([mockInsight]);

      const result = await service.generateInsights();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockWeatherService.findByDateRange).toHaveBeenCalled();
      expect(mockInsightModel.insertMany).toHaveBeenCalled();
    });

    it('should return empty array if no weather data', async () => {
      // Mock: Sem dados climáticos
      mockWeatherService.findByDateRange.mockResolvedValue([]);

      const result = await service.generateInsights();

      expect(result).toEqual([]);
      expect(mockInsightModel.insertMany).not.toHaveBeenCalled();
    });

    it('should generate multiple types of insights', async () => {
      // Dados que devem gerar vários insights
      const extremeWeatherLogs = [
        { temperature: 38, humidity: 85, windSpeed: 20, condition: 'clear', rainProbability: 60 },
        { temperature: 37, humidity: 82, windSpeed: 18, condition: 'clear', rainProbability: 65 },
        { temperature: 36, humidity: 80, windSpeed: 15, condition: 'clear', rainProbability: 70 },
      ];

      mockWeatherService.findByDateRange.mockResolvedValue(extremeWeatherLogs);

      const multipleInsights = [
        { type: InsightType.ALERT, title: 'Alerta: Calor Extremo' },
        { type: InsightType.ALERT, title: 'Umidade Muito Alta' },
        { type: InsightType.ALERT, title: 'Alta Probabilidade de Chuva' },
        { type: InsightType.SUMMARY, title: 'Resumo dos Últimos Dias' },
      ];

      mockInsightModel.insertMany.mockResolvedValue(multipleInsights);

      const result = await service.generateInsights();

      expect(result.length).toBeGreaterThan(1);
    });
  });

  // ==========================================
  // TESTE 3: Listar insights
  // ==========================================
  describe('findAll', () => {
    it('should return insights with limit', async () => {
      const mockInsights = [mockInsight, mockInsight];

      mockInsightModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockInsights),
          }),
        }),
      });

      const result = await service.findAll(20);

      expect(result).toEqual(mockInsights);
      expect(result.length).toBe(2);
    });
  });

  // ==========================================
  // TESTE 4: Obter insights mais recentes
  // ==========================================
  describe('getLatest', () => {
    it('should return latest 5 insights', async () => {
      const mockInsights = [
        { ...mockInsight, _id: '1' },
        { ...mockInsight, _id: '2' },
        { ...mockInsight, _id: '3' },
        { ...mockInsight, _id: '4' },
        { ...mockInsight, _id: '5' },
      ];

      mockInsightModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockInsights),
          }),
        }),
      });

      const result = await service.getLatest();

      expect(result).toEqual(mockInsights);
      expect(result.length).toBe(5);
      expect(mockInsightModel.find).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTE 5: Deletar insights antigos
  // ==========================================
  describe('deleteOld', () => {
    it('should delete insights older than 30 days', async () => {
      mockInsightModel.deleteMany.mockResolvedValue({ deletedCount: 10 });

      await service.deleteOld();

      expect(mockInsightModel.deleteMany).toHaveBeenCalled();
      
      // Verificar que foi chamado com filtro de data
      const callArgs = mockInsightModel.deleteMany.mock.calls[0][0];
      expect(callArgs).toHaveProperty('generatedAt');
      expect(callArgs.generatedAt).toHaveProperty('$lt');
    });
  });

  // ==========================================
  // TESTE 6: Lógica de análise - Temperatura
  // ==========================================
  describe('Temperature Analysis Logic', () => {
    it('should detect extreme heat', async () => {
      const hotWeatherLogs = [
        { temperature: 38, humidity: 70, windSpeed: 10, condition: 'clear', rainProbability: 0 },
        { temperature: 36, humidity: 68, windSpeed: 12, condition: 'clear', rainProbability: 0 },
      ];

      mockWeatherService.findByDateRange.mockResolvedValue(hotWeatherLogs);

      const insights = [
        { 
          type: InsightType.ALERT, 
          title: 'Alerta: Calor Extremo',
          severity: InsightSeverity.DANGER 
        },
      ];

      mockInsightModel.insertMany.mockResolvedValue(insights);

      const result = await service.generateInsights();

      expect(result.some(i => i.title?.includes('Calor Extremo'))).toBe(true);
    });

    it('should detect pleasant weather', async () => {
      const pleasantWeatherLogs = [
        { temperature: 24, humidity: 60, windSpeed: 8, condition: 'clear', rainProbability: 10 },
        { temperature: 22, humidity: 55, windSpeed: 10, condition: 'partly_cloudy', rainProbability: 5 },
      ];

      mockWeatherService.findByDateRange.mockResolvedValue(pleasantWeatherLogs);

      const insights = [
        { 
          type: InsightType.RECOMMENDATION, 
          title: 'Clima Agradável',
          severity: InsightSeverity.INFO 
        },
      ];

      mockInsightModel.insertMany.mockResolvedValue(insights);

      const result = await service.generateInsights();

      expect(result.some(i => i.title?.includes('Agradável'))).toBe(true);
    });
  });

  // ==========================================
  // TESTE 7: Lógica de análise - Umidade
  // ==========================================
  describe('Humidity Analysis Logic', () => {
    it('should detect high humidity', async () => {
      const humidWeatherLogs = [
        { temperature: 28, humidity: 85, windSpeed: 10, condition: 'cloudy', rainProbability: 50 },
        { temperature: 27, humidity: 88, windSpeed: 8, condition: 'cloudy', rainProbability: 60 },
      ];

      mockWeatherService.findByDateRange.mockResolvedValue(humidWeatherLogs);

      const insights = [
        { 
          type: InsightType.ALERT, 
          title: 'Umidade Muito Alta',
          severity: InsightSeverity.WARNING 
        },
      ];

      mockInsightModel.insertMany.mockResolvedValue(insights);

      const result = await service.generateInsights();

      expect(result.some(i => i.title?.includes('Umidade'))).toBe(true);
    });
  });
});