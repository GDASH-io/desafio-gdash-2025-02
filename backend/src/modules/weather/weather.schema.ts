import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  rainProbability: number;

  @Prop()
  description?: string;

  @Prop()
  visibility?: number;

  @Prop()
  solarRadiation?: number;

  @Prop()
  windDirection?: number;

  @Prop()
  pressure?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type WeatherLogDocument = WeatherLog & Document;

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ location: 1 });

