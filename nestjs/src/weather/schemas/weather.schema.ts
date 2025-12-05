import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class WeatherLog extends Document {
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() windSpeed: number;
  @Prop() condition: string;
  @Prop() location: string;
  @Prop({ default: Date.now }) timestamp: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(WeatherLog);
