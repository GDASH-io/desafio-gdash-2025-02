import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ required: true })
  weather_description: string;

  @Prop({ required: true })
  rain_probability: number;

  @Prop({ required: true, type: String })
  fetched_at: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
