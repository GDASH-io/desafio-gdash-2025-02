import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherLog } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let model: any;

  const mockWeatherModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
  }));

  (mockWeatherModel as any).find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue([{ temperature: 25, timestamp: '2025-01-01' }]),
    }),
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

    expect(mockWeatherModel).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('_id');
  });

  it('deve retornar uma lista de logs', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(model.find).toHaveBeenCalled();
  });

  it('findAll() deve chamar o banco com ordenação decrescente', async () => {
    await service.findAll();
    expect(model.find).toHaveBeenCalled();

    const mockSort = model.find().sort;
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
