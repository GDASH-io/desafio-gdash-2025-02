import { Climate } from '@/domain/enterprise/entities/climate';

export abstract class ClimateExport {
  abstract csvExport(climate: Climate[]): Promise<string>;
  abstract xlsxExport(climate: Climate[]): Promise<Buffer>;
}
