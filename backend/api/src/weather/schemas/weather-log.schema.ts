import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  weatherCondition: string;

  @Prop({ required: false })
  rainProbability?: number;

  @Prop({ required: false })
  source?: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
