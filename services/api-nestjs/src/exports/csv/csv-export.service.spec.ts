import { Test, TestingModule } from '@nestjs/testing';
import { CsvExportService } from '../csv-export.service';

describe('CsvExportService', () => {
  let service: CsvExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvExportService],
    }).compile();

    service = module.get<CsvExportService>(CsvExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
