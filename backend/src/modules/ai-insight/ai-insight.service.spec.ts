import { Test, TestingModule } from '@nestjs/testing';
import { AiInsightService } from './ai-insight.service';

describe('AiInsightService', () => {
  let service: AiInsightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiInsightService],
    }).compile();

    service = module.get<AiInsightService>(AiInsightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
