import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  temp_max: number;

  @Prop({ required: true })
  temp_min: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ required: true })
  rain_probability: number;

  @Prop({ required: true })
  weather_code: number;

  @Prop({ required: true })
  sky_condition: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
