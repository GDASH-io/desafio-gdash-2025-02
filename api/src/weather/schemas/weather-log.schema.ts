import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  pressure: number;

  @Prop()
  visibility: number;

  @Prop()
  uvIndex: number;

  @Prop()
  cloudiness: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  sunrise: Date;

  @Prop()
  sunset: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);