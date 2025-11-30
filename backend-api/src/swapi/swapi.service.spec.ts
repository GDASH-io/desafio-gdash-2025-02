import { Test, TestingModule } from '@nestjs/testing';
import { SwapiService } from './swapi.service';

describe('SwapiService', () => {
  let service: SwapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwapiService],
    }).compile();

    service = module.get<SwapiService>(SwapiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
