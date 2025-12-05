import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../weather/schemas/weather-log.schema';
export declare class WeatherService {
    private weatherLogModel;
    constructor(weatherLogModel: Model<WeatherLogDocument>);
    exportCsv(): Promise<string>;
    create(weatherLog: WeatherLog): Promise<WeatherLog>;
    findAll(): Promise<WeatherLog[]>;
}
