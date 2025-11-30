import { Inject, Injectable } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { WeatherDataItem } from '../weather/infraestructure/schema/weather.schema';
import { SpreadsheetAdapterPort } from './ports/spreadsheet.adapter.port';

@Injectable()
export class SpreadsheetService {
  constructor(
    @Inject(commonConstants.ports.SPREADSHEET)
    private readonly spreadsheetAdapter: SpreadsheetAdapterPort,
  ) {}

  generateCsv(data: WeatherDataItem[] | undefined): string {
    return this.spreadsheetAdapter.generateCsv(data);
  }

  async generateXlsx(
    data: Record<string, string | StringConstructor>[][],
  ): Promise<Buffer<ArrayBufferLike>> {
    return await this.spreadsheetAdapter.generateXlsx(data);
  }
}
