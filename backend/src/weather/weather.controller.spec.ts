import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  const mockWeatherService = {
    create: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ _id: '1', ...dto })),
    findAll: jest.fn().mockResolvedValue([{ temperature: 25 }]),
    generateCsv: jest.fn().mockResolvedValue('header\ndado'),
    generateXlsx: jest.fn().mockResolvedValue(Buffer.from('fake-excel')),

    generateInsights: jest.fn().mockResolvedValue({
      summary: 'Teste de IA',
      trend: 'stable',
      averageTemp: 25,
    }),
  };

  const mockResponse = {
    set: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

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

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o service.create', async () => {
    const dto: CreateWeatherLogDto = {
      temperature: 22,
      humidity: 80,
      wind_speed: 5,
      timestamp: 'now',
    };

    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve retornar array de logs', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('getInsights() deve retornar dados de inteligência', async () => {
    const result = await controller.getInsights();

    expect(service.generateInsights).toHaveBeenCalled();
    expect(result).toHaveProperty('summary');
    expect(result.trend).toBe('stable');
  });

  it('deve tratar erros do service (Simulação de DB fora do ar)', async () => {
    const errorMessage = 'Database connection lost';

    jest.spyOn(service, 'create').mockRejectedValue(new Error(errorMessage));

    const dto = {
      temperature: 22,
      humidity: 80,
      wind_speed: 5,
      timestamp: 'now',
    };

    await expect(controller.create(dto)).rejects.toThrow(errorMessage);
  });

  describe('Downloads', () => {
    it('exportCsv() deve definir headers e enviar arquivo', async () => {
      await controller.exportCsv(mockResponse);

      expect(service.generateCsv).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment'),
      );
      expect(mockResponse.send).toHaveBeenCalledWith('header\ndado');
    });

    it('exportXlsx() deve definir headers e enviar buffer', async () => {
      await controller.exportXlsx(mockResponse);

      expect(service.generateXlsx).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(Buffer));
    });
  });
});
