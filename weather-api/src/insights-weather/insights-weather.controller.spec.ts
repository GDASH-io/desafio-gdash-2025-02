import { Test, TestingModule } from '@nestjs/testing';
import { InsightsWeatherController } from './insights-weather.controller';
import { InsightsWeatherService } from './insights-weather.service';

describe('InsightsWeatherController', () => {
  let controller: InsightsWeatherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsWeatherController],
      providers: [InsightsWeatherService],
    }).compile();

    controller = module.get<InsightsWeatherController>(InsightsWeatherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
