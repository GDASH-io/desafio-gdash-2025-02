import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: Object, required: true })
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };

  @Prop({ required: true })
  temperature: number; // Celsius

  @Prop({ required: true })
  humidity: number; // Percentage

  @Prop({ required: true })
  windSpeed: number; // km/h

  @Prop({ required: true })
  condition: string; // clear, cloudy, rainy, etc.

  @Prop()
  rainProbability?: number; // Percentage

  @Prop()
  feelsLike?: number; // Celsius

  @Prop()
  pressure?: number; // hPa

  @Prop({ type: Object })
  rawData?: any; // Dados brutos da API
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);