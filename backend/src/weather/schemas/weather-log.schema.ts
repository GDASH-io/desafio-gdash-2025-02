import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Interface TypeScript para WeatherLog
 */
export interface IWeatherLog {
  timestamp: string;
  temperature: number;
  humidity: number;
  city?: string;
}

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog implements IWeatherLog {
  @Prop({ required: true, type: String })
  timestamp: string;

  @Prop({ required: true, type: Number })
  temperature: number;

  @Prop({ required: true, type: Number })
  humidity: number;

  @Prop({ required: false, type: String })
  city?: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

