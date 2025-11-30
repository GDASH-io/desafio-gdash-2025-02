import { Injectable } from '@nestjs/common';
import { Weather } from 'src/modules/weather/entities/weather.entity';
import { WeatherDataItem } from 'src/modules/weather/infraestructure/schema/weather.schema';
import writeXlsxFile from 'write-excel-file/node';
import { SpreadsheetAdapterPort } from '../../ports/spreadsheet.adapter.port';

@Injectable()
export class SpreadsheetAdapter implements SpreadsheetAdapterPort {
  generateCsv(data: WeatherDataItem[] | undefined): string {
    if (!data) return '';
    const formattedData = Weather.formattedItemsToCsv(data);
    const headers = Object.keys(formattedData[0]).join(',');
    const rows = formattedData.map((item) => Object.values(item).join(','));

    return [headers, ...rows].join('\n');
  }
  async generateXlsx(
    data: Record<string, string | StringConstructor>[][],
  ): Promise<Buffer<ArrayBufferLike>> {
    const xlsxBuffer = await writeXlsxFile(data, { buffer: true });
    return xlsxBuffer;
  }
}
