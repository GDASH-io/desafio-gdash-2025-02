import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Weather extends Document {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  feels_like: number;

  @Prop({ required: true })
  temp_min: number;

  @Prop({ required: true })
  temp_max: number;

  @Prop({ required: true })
  pressure: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ required: true })
  clouds: number;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  collected_at: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
