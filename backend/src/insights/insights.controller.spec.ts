import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';

describe('InsightsController', () => {
  let controller: InsightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
