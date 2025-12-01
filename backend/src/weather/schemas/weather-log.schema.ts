import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ _id: false })
export class Location {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lon: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({
  timestamps: true,
  collection: 'weather_logs',
})
export class WeatherLog {
  @Prop({ required: true, type: String, index: true })
  timestamp: string;

  @Prop({ type: LocationSchema, required: true })
  location: Location;

  @Prop({ type: Number, default: null })
  temperature?: number | null;

  @Prop({ type: Number, default: null })
  humidity?: number | null;

  @Prop({ type: Number, default: null })
  windSpeed?: number | null;

  @Prop({ type: Number, default: null })
  weatherCode?: number | null;

  @Prop({ type: String, required: true, index: true })
  condition: string;

  @Prop({ type: Number, default: null })
  precipitationProbability?: number | null;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índices para melhorar performance de queries
WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ 'location.name': 1 });
WeatherLogSchema.index({ timestamp: -1, 'location.name': 1 });
