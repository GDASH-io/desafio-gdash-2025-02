import { Test, TestingModule } from '@nestjs/testing';
import { SpacexController } from './spacex.controller';

describe('SpacexController', () => {
  let controller: SpacexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacexController],
    }).compile();

    controller = module.get<SpacexController>(SpacexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
