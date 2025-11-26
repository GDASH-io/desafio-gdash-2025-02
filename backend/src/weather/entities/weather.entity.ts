import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true })
export class Weather {
  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  windSpeed: number;

  @Prop()
  rainProbability: number;

  @Prop()
  insight: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
