import { ClimateExport } from '@/domain/aplication/export/climate-export';
import { Climate } from '@/domain/enterprise/entities/climate';

export class FakeExport implements ClimateExport {
  async csvExport(climate: Climate[]): Promise<string> {
    return JSON.stringify(climate);
  }
  async xlsxExport(climate: Climate[]): Promise<Buffer> {
    return Buffer.from(JSON.stringify(climate));
  }
}
