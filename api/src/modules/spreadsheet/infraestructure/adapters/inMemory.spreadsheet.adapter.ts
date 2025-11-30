import { Injectable } from '@nestjs/common';
import { WeatherDataItem } from 'src/modules/weather/infraestructure/schema/weather.schema';
import { SpreadsheetAdapterPort } from '../../ports/spreadsheet.adapter.port';

@Injectable()
export class InMemorySpreadsheetAdapter implements SpreadsheetAdapterPort {
  private mockCsvOutput: string = 'mock-csv-data';
  private mockXlsxBuffer: Buffer = Buffer.from('mock-xlsx-data');

  private shouldFailCsv: boolean = false;
  private shouldFailXlsx: boolean = false;

  private generateCsvCallCount: number = 0;
  private generateXlsxCallCount: number = 0;

  private lastCsvData: WeatherDataItem[] | undefined = undefined;
  private lastXlsxData:
    | Record<string, string | StringConstructor>[][]
    | undefined = undefined;

  generateCsv(data: WeatherDataItem[] | undefined): string {
    this.generateCsvCallCount++;
    this.lastCsvData = data;

    if (this.shouldFailCsv) {
      throw new Error('InMemory GenerateCsv failed');
    }

    return this.mockCsvOutput;
  }

  async generateXlsx(
    data: Record<string, string | StringConstructor>[][],
  ): Promise<Buffer<ArrayBufferLike>> {
    this.generateXlsxCallCount++;
    this.lastXlsxData = data;

    if (this.shouldFailXlsx) {
      throw new Error('InMemory GenerateXlsx failed');
    }

    return Promise.resolve(this.mockXlsxBuffer);
  }

  setMockCsvOutput(csv: string): void {
    this.mockCsvOutput = csv;
  }

  setMockXlsxBuffer(buffer: Buffer): void {
    this.mockXlsxBuffer = buffer;
  }

  setShouldFailCsv(shouldFail: boolean): void {
    this.shouldFailCsv = shouldFail;
  }

  setShouldFailXlsx(shouldFail: boolean): void {
    this.shouldFailXlsx = shouldFail;
  }

  getGenerateCsvCallCount(): number {
    return this.generateCsvCallCount;
  }

  getGenerateXlsxCallCount(): number {
    return this.generateXlsxCallCount;
  }

  getLastCsvData(): WeatherDataItem[] | undefined {
    return this.lastCsvData;
  }

  getLastXlsxData():
    | Record<string, string | StringConstructor>[][]
    | undefined {
    return this.lastXlsxData;
  }

  reset(): void {
    this.mockCsvOutput = 'mock-csv-data';
    this.mockXlsxBuffer = Buffer.from('mock-xlsx-data');

    this.shouldFailCsv = false;
    this.shouldFailXlsx = false;

    this.generateCsvCallCount = 0;
    this.generateXlsxCallCount = 0;

    this.lastCsvData = undefined;
    this.lastXlsxData = undefined;
  }
}
