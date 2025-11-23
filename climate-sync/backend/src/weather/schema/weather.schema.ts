import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Weather extends Document {
  @Prop({ type: Object })
  data: any;

  @Prop({ type: Object })
  location: any;

  @Prop()
  source: string;

  @Prop()
  timestamp: string;

  @Prop()
  version: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
