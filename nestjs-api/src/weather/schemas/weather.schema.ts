import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true }) 
export class Weather {
  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  temperature: number;

  @Prop()
  wind_speed: number;

  @Prop()
  time: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);