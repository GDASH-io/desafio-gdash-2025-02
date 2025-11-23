import { Test, TestingModule } from '@nestjs/testing';
import { SpacexController } from './spacex.controller';
import { SpacexService } from './spacex.service';

describe('SpacexController', () => {
  let controller: SpacexController;
  let service: SpacexService;

  const mockSpacexService = {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacexController],
      providers: [
        {
          provide: SpacexService,
          useValue: mockSpacexService,
        },
      ],
    }).compile();

    controller = module.get<SpacexController>(SpacexController);
    service = module.get<SpacexService>(SpacexService);
  });

  it('findAll() deve chamar o service com paginação', async () => {
    await controller.findAll('1', '10');
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('findAll() deve usar valores padrão (page=1, limit=10) se não forem fornecidos', async () => {
    await controller.findAll(undefined as any, undefined as any);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
