import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherLog } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              JSON.stringify({
                summary: 'Resumo gerado pela IA Mockada',
                alert: 'Alerta IA',
              }),
          },
        }),
      }),
    })),
  };
});

describe('WeatherService', () => {
  let service: WeatherService;
  let model: any;

  const mockWeatherModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { temperature: 26, humidity: 60, wind_speed: 10, timestamp: 'now' },
            { temperature: 25, humidity: 60, wind_speed: 10, timestamp: 'old' },
          ]),
        }),
        exec: jest
          .fn()
          .mockResolvedValue([{ temperature: 25, timestamp: '2025-01-01' }]),
      }),
    }),
    save: jest.fn(),
  };

  const mockModelConstructor = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
  }));
  Object.assign(mockModelConstructor, mockWeatherModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockModelConstructor,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'GEMINI_API_KEY') return 'fake_api_key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    model = module.get(getModelToken(WeatherLog.name));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve salvar um log novo', async () => {
    const dto = {
      temperature: 30,
      humidity: 50,
      wind_speed: 10,
      timestamp: '2025-11-21',
    };
    const result = await service.create(dto);
    expect(result).toHaveProperty('_id');
  });

  it('deve retornar uma lista de logs', async () => {
    await service.findAll();
    expect(model.find).toHaveBeenCalled();
  });

  describe('Exportação', () => {
    it('generateCsv() deve retornar string', async () => {
      const csv = await service.generateCsv();
      expect(typeof csv).toBe('string');
      expect(csv).toContain('Data/Hora');
    });

    it('generateXlsx() deve retornar Buffer', async () => {
      const buffer = await service.generateXlsx();
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('Inteligência (Insights)', () => {
    it('Deve usar a IA (Gemini) quando configurada com sucesso', async () => {
      const insights = await service.generateInsights();

      expect(insights.summary).toBe('Resumo gerado pela IA Mockada');
      expect(insights.alert).toBe('Alerta IA');
      expect(insights.averageTemp).toBe(25.5);
    });

    it('Deve usar Fallback (Heurística) se a IA falhar', async () => {
      (service as any).genAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
        }),
      };

      const insights = await service.generateInsights();

      expect(insights.summary).toContain('(Modo Offline)');
      expect(insights.trend).toBe('up');
    });

    it('Deve retornar vazio se não houver logs', async () => {
      model.find().sort().limit().exec = jest.fn().mockResolvedValue([]);

      const insights = await service.generateInsights();
      expect(insights.summary).toBe('Sem dados.');
    });
  });

  describe('Cobertura de Tendências (Down)', () => {
    const logsDescendo = [
      { temperature: 20, humidity: 60, wind_speed: 10 },
      { temperature: 25, humidity: 60, wind_speed: 10 },
    ];

    it('IA: Deve detectar tendência de queda', async () => {
      model.find().sort().limit().exec.mockResolvedValueOnce(logsDescendo);

      const insights = await service.generateInsights();
      expect(insights.trend).toBe('down');
    });

    it('Heurística: Deve detectar tendência de queda', async () => {
      model.find().sort().limit().exec.mockResolvedValueOnce(logsDescendo);
      (service as any).genAI = null;

      const insights = await service.generateInsights();
      expect(insights.trend).toBe('down');
      expect(insights.summary).toContain('a descer');
    });
  });

  describe('Cobertura de Configuração (Logger)', () => {
    it('Deve logar erro se não houver API KEY no construtor', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await Test.createTestingModule({
        providers: [
          WeatherService,
          {
            provide: getModelToken(WeatherLog.name),
            useValue: mockModelConstructor,
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => null),
            },
          },
        ],
      }).compile();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('não encontrada'),
      );
    });
  });

  describe('Cobertura de Alertas (Heurística)', () => {
    it('Deve gerar alerta de VENTOS FORTES no modo offline', async () => {
      model
        .find()
        .sort()
        .limit()
        .exec.mockResolvedValueOnce([
          { temperature: 25, humidity: 60, wind_speed: 50, timestamp: 'now' },
          { temperature: 25, humidity: 60, wind_speed: 50, timestamp: 'old' },
        ]);

      (service as any).genAI = null;
      const insights = await service.generateInsights();
      expect(insights.alert).toContain('Ventos fortes');
    });

    it('Deve gerar alerta de CALOR EXTREMO no modo offline', async () => {
      model
        .find()
        .sort()
        .limit()
        .exec.mockResolvedValueOnce([
          { temperature: 40, humidity: 60, wind_speed: 5, timestamp: 'now' },
          { temperature: 40, humidity: 60, wind_speed: 5, timestamp: 'old' },
        ]);

      (service as any).genAI = null;

      const insights = await service.generateInsights();

      expect(insights.alert).toContain('Calor extremo');
    });
  });
});
