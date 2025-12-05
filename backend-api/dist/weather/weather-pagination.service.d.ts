import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { PaginationDto } from './dto/pagination.dto';
export declare class WeatherPaginationService {
    private weatherLogModel;
    constructor(weatherLogModel: Model<WeatherLogDocument>);
    paginate(pagination: PaginationDto): Promise<{
        data: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, WeatherLog, {}, {}> & WeatherLog & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}
