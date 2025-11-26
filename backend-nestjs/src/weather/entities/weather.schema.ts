import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ collection: 'weather_logs' }) 
export class Weather {
  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;

  @Prop({ required: true })
  temp: number; // Celsius

  @Prop({ required: true })
  humidity: number; // Percentage

  @Prop({ required: true })
  wind_speed: number; // km/h

  @Prop({ required: true })
  precipitation: number; // mm

  @Prop({ required: true })
  is_day: number; // 1 = Day, 0 = Night

  @Prop({ required: true })
  insight: string; // AI Generated Text

  @Prop({ required: true })
  collected_at: string; // ISO Date String
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);