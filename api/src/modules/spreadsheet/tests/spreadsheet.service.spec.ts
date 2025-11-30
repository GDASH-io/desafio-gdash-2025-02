import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { WeatherDataItem } from '../../weather/infraestructure/schema/weather.schema';
import { InMemorySpreadsheetAdapter } from '../infraestructure/adapters/inMemory.spreadsheet.adapter';
import { SpreadsheetService } from '../spreadsheet.service';

describe('SpreadsheetService', () => {
  let service: SpreadsheetService;
  let spreadsheetAdapter: InMemorySpreadsheetAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpreadsheetService,
        {
          provide: commonConstants.ports.SPREADSHEET,
          useClass: InMemorySpreadsheetAdapter,
        },
      ],
    }).compile();

    service = module.get<SpreadsheetService>(SpreadsheetService);
    spreadsheetAdapter = module.get(commonConstants.ports.SPREADSHEET);
    spreadsheetAdapter.reset();
  });

  describe('generateCsv', () => {
    const mockWeatherData: WeatherDataItem[] = [
      {
        date: '2025-11-28',
        hour: '10:00',
        interval: { value: 900, unit: 'seconds' },
        temperature_2m: { value: 25.5, unit: '°C' },
        relative_humidity_2m: { value: 65, unit: '%' },
        precipitation_probability: { value: 10, unit: '%' },
        precipitation: { value: 0, unit: 'mm' },
        rain: { value: 0, unit: 'mm' },
        weather_code: { value: 0, unit: 'wmo code' },
        pressure_msl: { value: 1013.5, unit: 'hPa' },
        cloud_cover: { value: 20, unit: '%' },
        visibility: { value: 10000, unit: 'm' },
        evapotranspiration: { value: 0.5, unit: 'mm' },
        et0_fao_evapotranspiration: { value: 0.6, unit: 'mm' },
        wind_speed_10m: { value: 15.2, unit: 'km/h' },
        wind_speed_80m: { value: 20.5, unit: 'km/h' },
        wind_speed_120m: { value: 22.3, unit: 'km/h' },
        wind_direction_10m: { value: 180, unit: '°' },
        wind_direction_80m: { value: 185, unit: '°' },
        wind_direction_120m: { value: 190, unit: '°' },
        wind_speed_180m: { value: 25.1, unit: 'km/h' },
        wind_direction_180m: { value: 195, unit: '°' },
        wind_gusts_10m: { value: 30.5, unit: 'km/h' },
        temperature_80m: { value: 24.2, unit: '°C' },
        temperature_120m: { value: 23.8, unit: '°C' },
        temperature_180m: { value: 23.5, unit: '°C' },
        is_day: { value: 1, unit: '' },
        uv_index: { value: 5, unit: '' },
        uv_index_clear_sky: { value: 6, unit: '' },
        direct_radiation: { value: 500, unit: 'W/m²' },
      },
    ];

    it('should call spreadsheetAdapter.generateCsv with weather data', () => {
      const expectedCsv = 'date,hour,temperature_2m\n2025-11-28,10:00,25.5';
      spreadsheetAdapter.setMockCsvOutput(expectedCsv);

      const result = service.generateCsv(mockWeatherData);

      expect(spreadsheetAdapter.getGenerateCsvCallCount()).toBe(1);
      expect(spreadsheetAdapter.getLastCsvData()).toEqual(mockWeatherData);
      expect(result).toBe(expectedCsv);
    });

    it('should handle undefined weather data', () => {
      const expectedCsv = '';
      spreadsheetAdapter.setMockCsvOutput(expectedCsv);

      const result = service.generateCsv(undefined);

      expect(spreadsheetAdapter.getGenerateCsvCallCount()).toBe(1);
      expect(spreadsheetAdapter.getLastCsvData()).toBeUndefined();
      expect(result).toBe(expectedCsv);
    });

    it('should handle empty weather data array', () => {
      const expectedCsv = 'date,hour,temperature_2m\n';
      spreadsheetAdapter.setMockCsvOutput(expectedCsv);

      const result = service.generateCsv([]);

      expect(spreadsheetAdapter.getGenerateCsvCallCount()).toBe(1);
      expect(spreadsheetAdapter.getLastCsvData()).toEqual([]);
      expect(result).toBe(expectedCsv);
    });

    it('should return CSV string from adapter', () => {
      const multipleData: WeatherDataItem[] = [
        mockWeatherData[0],
        {
          ...mockWeatherData[0],
          date: '2025-11-29',
          hour: '14:00',
          temperature_2m: { value: 28.3, unit: '°C' },
        },
      ];

      const expectedCsv =
        'date,hour,temperature_2m\n2025-11-28,10:00,25.5\n2025-11-29,14:00,28.3';
      spreadsheetAdapter.setMockCsvOutput(expectedCsv);

      const result = service.generateCsv(multipleData);

      expect(result).toBe(expectedCsv);
      expect(spreadsheetAdapter.getLastCsvData()).toEqual(multipleData);
    });
  });

  describe('generateXlsx', () => {
    const mockXlsxData: Record<string, string | StringConstructor>[][] = [
      [
        { header: 'Name', value: 'John Doe' },
        { header: 'Age', value: '30' },
      ],
      [
        { header: 'Name', value: 'Jane Smith' },
        { header: 'Age', value: '25' },
      ],
    ];

    it('should call spreadsheetAdapter.generateXlsx with data', async () => {
      const expectedBuffer = Buffer.from('mock-xlsx-content');
      spreadsheetAdapter.setMockXlsxBuffer(expectedBuffer);

      const result = await service.generateXlsx(mockXlsxData);

      expect(spreadsheetAdapter.getGenerateXlsxCallCount()).toBe(1);
      expect(spreadsheetAdapter.getLastXlsxData()).toEqual(mockXlsxData);
      expect(result).toBe(expectedBuffer);
    });

    it('should handle empty data array', async () => {
      const expectedBuffer = Buffer.from('');
      spreadsheetAdapter.setMockXlsxBuffer(expectedBuffer);

      const result = await service.generateXlsx([]);

      expect(spreadsheetAdapter.getGenerateXlsxCallCount()).toBe(1);
      expect(spreadsheetAdapter.getLastXlsxData()).toEqual([]);
      expect(result).toBe(expectedBuffer);
    });

    it('should return Buffer from adapter', async () => {
      const xlsxBuffer = Buffer.from('binary-xlsx-content');
      spreadsheetAdapter.setMockXlsxBuffer(xlsxBuffer);

      const result = await service.generateXlsx(mockXlsxData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result).toBe(xlsxBuffer);
    });

    it('should handle complex data structures', async () => {
      const complexData: Record<string, string | StringConstructor>[][] = [
        [
          { date: '2025-11-28', temperature: '25.5' },
          { date: '2025-11-29', temperature: '26.8' },
        ],
        [
          { humidity: '65%', pressure: '1013.5 hPa' },
          { humidity: '70%', pressure: '1012.0 hPa' },
        ],
      ];

      const expectedBuffer = Buffer.from('complex-xlsx-data');
      spreadsheetAdapter.setMockXlsxBuffer(expectedBuffer);

      const result = await service.generateXlsx(complexData);

      expect(spreadsheetAdapter.getLastXlsxData()).toEqual(complexData);
      expect(result).toBe(expectedBuffer);
    });

    it('should propagate errors from adapter', async () => {
      spreadsheetAdapter.setShouldFailXlsx(true);

      await expect(service.generateXlsx(mockXlsxData)).rejects.toThrow(
        'InMemory GenerateXlsx failed',
      );
      expect(spreadsheetAdapter.getLastXlsxData()).toEqual(mockXlsxData);
    });
  });
});
