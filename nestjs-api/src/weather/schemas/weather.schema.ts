import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true })
export class Weather {
  @Prop()
  temperature: number;

  @Prop()
  windspeed: number;

  @Prop()
  conditionCode: number;

  @Prop() // Aqui ficará sua "IA" básica
  aiInsight: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
