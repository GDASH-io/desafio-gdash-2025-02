import { Test, TestingModule } from '@nestjs/testing';
import { InsightsIaService } from './insights-ia.service';

describe('InsightsIaService', () => {
  let service: InsightsIaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsightsIaService],
    }).compile();

    service = module.get<InsightsIaService>(InsightsIaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
