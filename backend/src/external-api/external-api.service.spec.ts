import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService', () => {
  let service: ExternalApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalApiService],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
