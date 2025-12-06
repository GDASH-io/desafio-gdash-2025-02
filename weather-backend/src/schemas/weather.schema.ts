import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  feels_like: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  pressure: number;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ default: 0 })
  wind_direction: number;

  @Prop({ required: true })
  weather_condition: string;

  @Prop({ required: true })
  weather_main: string;

  @Prop({ default: 0 })
  cloudiness: number;

  @Prop({ default: 0 })
  visibility: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  collection_time: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);

WeatherSchema.index({ city: 1, collection_time: -1 });
WeatherSchema.index({ collection_time: -1 });
