import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  temperature_c: number;

  @Prop()
  wind_speed_kmh: number;

  @Prop()
  weather_code: number;

  @Prop({ required: true })
  condition: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
