import { WeatherDataItem } from '../../weather/infraestructure/schema/weather.schema';

export interface SpreadsheetAdapterPort {
  generateCsv(data: WeatherDataItem[] | undefined): string;
  generateXlsx(
    data: Record<string, string | StringConstructor>[][],
  ): Promise<Buffer<ArrayBufferLike>>;
}
