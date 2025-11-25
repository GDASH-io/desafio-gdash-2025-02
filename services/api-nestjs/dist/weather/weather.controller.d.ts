import { WeatherService } from './weather.service';
import { CsvExportService } from '../exports/csv/csv-export.service';
import { XlsxExportService } from 'src/exports/xlsx/xlsx-export.service';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { StreamableFile } from '@nestjs/common';
export declare class WeatherController {
    private readonly weatherService;
    private readonly csvExportService;
    private readonly xlsxExportService;
    constructor(weatherService: WeatherService, csvExportService: CsvExportService, xlsxExportService: XlsxExportService);
    logWeatherData(logsWeather: logsWeatherDTO): Promise<import("../schema/user.schema").WeatherLogs>;
    getAllLogs(): Promise<import("../schema/user.schema").WeatherLogs[]>;
    getLogById(id: string): Promise<import("../schema/user.schema").WeatherLogs>;
    updateLog(id: string, updateData: Partial<logsWeatherDTO>): Promise<import("../schema/user.schema").WeatherLogs>;
    deleteLog(id: string): Promise<{
        message: string;
        data: import("../schema/user.schema").WeatherLogs;
    }>;
    exportLogsToCsv(): Promise<StreamableFile>;
    exportLogsToXlsx(): Promise<StreamableFile>;
}
