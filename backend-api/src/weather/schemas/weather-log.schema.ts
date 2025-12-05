import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type WeatherLogDocument = mongoose.HydratedDocument<WeatherLog>;

@Schema({ timestamps: true, collection: 'weather_logs' })
export class WeatherLog {
  @Prop()
  timestamp: Date;

  @Prop()
  location: string;

  @Prop()
  temperature_c: number;

  @Prop()
  humidity_percent: number;

  @Prop()
  wind_speed_kmh: number;

  @Prop()
  condition: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  insights: any;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
