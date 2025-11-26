import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiController } from './external-api.controller';

describe('ExternalApiController', () => {
  let controller: ExternalApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalApiController],
    }).compile();

    controller = module.get<ExternalApiController>(ExternalApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
