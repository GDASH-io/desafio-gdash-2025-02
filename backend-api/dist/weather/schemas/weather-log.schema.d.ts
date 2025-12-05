import * as mongoose from 'mongoose';
export type WeatherLogDocument = mongoose.HydratedDocument<WeatherLog>;
export declare class WeatherLog {
    timestamp: Date;
    location: string;
    temperature_c: number;
    humidity_percent: number;
    wind_speed_kmh: number;
    condition: string;
    insights: any;
}
export declare const WeatherLogSchema: mongoose.Schema<WeatherLog, mongoose.Model<WeatherLog, any, any, any, mongoose.Document<unknown, any, WeatherLog, any, {}> & WeatherLog & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, WeatherLog, mongoose.Document<unknown, {}, mongoose.FlatRecord<WeatherLog>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<WeatherLog> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
