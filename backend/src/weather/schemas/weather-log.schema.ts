import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ required: true })
  timestamp: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
