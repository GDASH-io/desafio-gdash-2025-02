import { HydratedDocument } from 'mongoose';
export type WeatherDocument = HydratedDocument<Weather>;
export declare class Weather {
    temperature: number;
    humidity: number;
    windSpeed: number;
    insight: string;
}
export declare const WeatherSchema: import("mongoose").Schema<Weather, import("mongoose").Model<Weather, any, any, any, import("mongoose").Document<unknown, any, Weather, any, {}> & Weather & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Weather, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Weather>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Weather> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
