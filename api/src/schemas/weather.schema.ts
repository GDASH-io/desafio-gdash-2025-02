import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'weather_logs', timestamps: true })
export class WeatherLog extends Document {
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() wind_speed: number;
  @Prop() condition: number;
  @Prop() rain_probability: number;
  @Prop() timestamp: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
