import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  feelsLike: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  windDirection: number;

  @Prop({ required: true })
  pressure: number;

  @Prop({ required: true })
  uvIndex: number;

  @Prop({ required: true })
  visibility: number;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  rainProbability: number;

  @Prop({ required: true })
  cloudCover: number;

  @Prop({ required: true, default: 'open-meteo' })
  source: string;

  @Prop()
  workerId?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ city: 1, timestamp: -1 });
WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ createdAt: -1 });
