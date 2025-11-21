import { Test, TestingModule } from '@nestjs/testing';
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
});
