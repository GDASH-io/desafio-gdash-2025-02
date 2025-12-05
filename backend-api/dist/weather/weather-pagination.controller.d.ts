import { WeatherPaginationService } from './weather-pagination.service';
import { PaginationDto } from './dto/pagination.dto';
export declare class WeatherPaginationController {
    private readonly weatherPaginationService;
    constructor(weatherPaginationService: WeatherPaginationService);
    getPaginated(paginationDto: PaginationDto): Promise<{
        data: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/weather-log.schema").WeatherLog, {}, {}> & import("./schemas/weather-log.schema").WeatherLog & {
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
