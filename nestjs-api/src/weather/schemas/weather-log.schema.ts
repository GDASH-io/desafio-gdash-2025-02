import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Number })
  temperature: number;

  @Prop({ required: true, type: Number })
  windspeed: number;

  @Prop({ required: true, type: Number })
  weathercode: number;

  @Prop({ required: true, type: Number })
  is_day: number;

  @Prop({ type: Number })
  humidity?: number;

  @Prop({ type: Number })
  precipitation_probability?: number;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);


WeatherLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });
