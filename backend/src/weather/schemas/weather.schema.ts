import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true }) 
export class Weather {
  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;

  @Prop({ required: true })
  temp_c: number;

  @Prop()
  humidity: number;

  @Prop()
  wind_speed: number;

  @Prop()
  condition_code: number;

  @Prop()
  rain_prob: number;

  @Prop()
  collected_at: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);