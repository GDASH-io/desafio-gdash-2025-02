import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true }) // Cria createdAt e updatedAt automaticamente
export class WeatherLog {
  @Prop({ required: true, type: Object })
  location: {
    lat: number;
    lon: number;
  };

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop()
  radiation: number; // Importante para GDASH [cite: 34]

  @Prop()
  wind_speed: number;

  @Prop()
  weather_code: number;

  @Prop({ required: true, index: true }) // Indexado para consultas rápidas [cite: 99]
  timestamp: string;

}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);