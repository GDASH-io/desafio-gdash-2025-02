// Antes de salvar qualquer coisa, precisamos definir a estrutura, mesmo em um banco NoSQL como o MongoDB. Isso é feito com o Schema e a biblioteca Mongoose
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop()
  latitude: number; 

  @Prop()
  longitude: number;

  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  wind_speed: number;

  @Prop()
  condition: string;
  
  @Prop()
  timestamp: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);