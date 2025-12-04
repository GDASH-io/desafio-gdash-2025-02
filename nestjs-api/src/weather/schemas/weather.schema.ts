import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  timestamp: string;

  @Prop()
  collected_at: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  wind_speed: number;

  @Prop()
  precipitation: number;

  @Prop()
  weather_code: number;

  @Prop()
  condition: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
