import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true })
  temperatureC: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeedKmh: number;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  rainProbability: number;

  @Prop({ type: Object, required: false })
  raw?: any;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índices para melhor performance nas consultas
WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ city: 1, timestamp: -1 });

