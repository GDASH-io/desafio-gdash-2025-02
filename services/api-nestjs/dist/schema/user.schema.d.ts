import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
export type WeatherLogsDocument = HydratedDocument<WeatherLogs>;
export declare class WeatherLogs {
    temperatura: number;
    umidade: number;
    vento: number;
    condicao: string;
    probabilidade_chuva: number;
    data_coleta: string;
}
export declare const WeatherLogsSchema: MongooseSchema;
