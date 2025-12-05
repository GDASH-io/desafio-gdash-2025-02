import { WeatherService } from '../weather/weather.service';
import { WeatherLog } from '../weather/schemas/weather-log.schema';
import type { Response } from 'express';
export declare class WeatherController {
    private readonly weatherService;
    constructor(weatherService: WeatherService);
    createlog(logData: WeatherLog): Promise<WeatherLog>;
    findAll(): Promise<WeatherLog[]>;
    exportCsv(): Promise<string>;
    exportToXLSX(res: Response): Promise<Response<any, Record<string, any>>>;
}
