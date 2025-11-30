import { Test, TestingModule } from '@nestjs/testing';
import { SwapiController } from './swapi.controller';

describe('SwapiController', () => {
  let controller: SwapiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwapiController],
    }).compile();

    controller = module.get<SwapiController>(SwapiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
