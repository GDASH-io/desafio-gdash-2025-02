import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop()
    timezone: string;

    @Prop()
    timestamp: string;

    @Prop()
    temperature: number;

    @Prop()
    humidity: number;

    @Prop()
    is_day: number;

    @Prop()
    precipitation: number;

    @Prop()
    rain: number;

    @Prop()
    weather_code: number;

    @Prop()
    wind_speed: number;

    @Prop()
    source: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
