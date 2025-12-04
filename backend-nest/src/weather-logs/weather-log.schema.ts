import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop() city: string;
  @Prop() datetime: string;
  @Prop() temperature: number;
  @Prop() wind_speed: number;
  @Prop() condition_code: number;
  @Prop() humidity: number;
  @Prop() precipitation_probability: number;
  @Prop() received_at?: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
