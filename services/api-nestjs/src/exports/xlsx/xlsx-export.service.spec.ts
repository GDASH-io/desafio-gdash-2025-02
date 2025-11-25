import { Test, TestingModule } from '@nestjs/testing';
import { XlsxExportService } from '../xlsx-export/xlsx-export.service';

describe('XlsxExportService', () => {
  let service: XlsxExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XlsxExportService],
    }).compile();

    service = module.get<XlsxExportService>(XlsxExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
