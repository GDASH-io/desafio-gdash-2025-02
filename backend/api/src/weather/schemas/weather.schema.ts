import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  description: string;

  @Prop()
  city: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
