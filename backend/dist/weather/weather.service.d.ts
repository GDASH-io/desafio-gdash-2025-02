import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather } from './entities/weather.entity';
import { Model } from 'mongoose';
import { UpdateWeatherDto } from './dto/update-weather.dto';
export declare class WeatherService {
    private weatherModel;
    private readonly logger;
    private genAI;
    constructor(weatherModel: Model<Weather>);
    create(createWeatherDto: CreateWeatherDto): Promise<Weather>;
    private generateFallbackInsight;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Weather, {}, {}> & Weather & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    findOne(id: number): string;
    update(id: number, updateWeatherDto: UpdateWeatherDto): string;
    remove(id: number): string;
}
