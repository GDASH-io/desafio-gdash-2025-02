import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { Model } from 'mongoose';
import { WeatherLogs } from 'src/schema/user.schema';
export declare class WeatherService {
    private weatherLogsModel;
    constructor(weatherLogsModel: Model<WeatherLogs>);
    logWeatherPost(logsWeather: logsWeatherDTO): Promise<WeatherLogs>;
    logWeatherGet(): Promise<WeatherLogs[]>;
    logWeatherGetById(id: string): Promise<WeatherLogs | null>;
    updateLogWeather(id: string, updateData: Partial<logsWeatherDTO>): Promise<WeatherLogs | null>;
    deleteLogWeather(id: string): Promise<WeatherLogs | null>;
}
