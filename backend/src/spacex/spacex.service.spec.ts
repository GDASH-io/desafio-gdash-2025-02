import { Test, TestingModule } from '@nestjs/testing';
import { SpacexService } from './spacex.service';

describe('SpacexService', () => {
  let service: SpacexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpacexService],
    }).compile();

    service = module.get<SpacexService>(SpacexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
