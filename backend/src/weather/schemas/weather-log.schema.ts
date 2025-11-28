import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
    @Prop({ required: true })
    source!: string;

    @Prop({ required: true })
    city!: string;

    @Prop({ required: true })
    latitude!: number;

    @Prop({ required: true })
    longitude!: number;

    @Prop({ type: Date, required: true })
    collectedAt!: Date;

    @Prop({ required: true })
    temperatureC!: number;

    @Prop()
    humidityPercent?: number;

    @Prop()
    windSpeedKmh?: number;

    @Prop()
    condition?: string;

    @Prop({ type: SchemaTypes.Mixed })
    raw?: Record<string, any>;

    @Prop()
    locationId?: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);