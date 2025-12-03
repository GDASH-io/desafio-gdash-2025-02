import { Test, TestingModule } from '@nestjs/testing';
import { InsightsWeatherService } from './insights-weather.service';

describe('InsightsWeatherService', () => {
  let service: InsightsWeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsightsWeatherService],
    }).compile();

    service = module.get<InsightsWeatherService>(InsightsWeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
