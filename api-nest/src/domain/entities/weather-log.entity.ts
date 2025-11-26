import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true, collection: 'weather_logs' })
export class WeatherLog {
  @Prop({ required: true, type: Date, index: true })
  timestamp: Date;

  @Prop({ required: true, type: String, index: true })
  city: string;

  @Prop({ required: true, type: String })
  source: string;

  @Prop({ required: true, type: Number })
  temperature_c: number;

  @Prop({ required: true, type: Number })
  relative_humidity: number;

  @Prop({ required: true, type: Number, default: 0 })
  precipitation_mm: number;

  @Prop({ required: true, type: Number })
  wind_speed_m_s: number;

  @Prop({ required: true, type: Number })
  clouds_percent: number;

  @Prop({ required: true, type: Number })
  weather_code: number;

  @Prop({ type: Number })
  estimated_irradiance_w_m2?: number;

  @Prop({ type: Number })
  temp_effect_factor?: number;

  @Prop({ type: String, enum: ['low', 'medium', 'high'] })
  soiling_risk?: string;

  @Prop({ type: Boolean, default: false })
  wind_derating_flag?: boolean;

  @Prop({ type: Number })
  pv_derating_pct?: number;

  @Prop({ type: Number })
  uv_index?: number;

  @Prop({ type: Number })
  pressure_hpa?: number;

  @Prop({ type: Number })
  visibility_m?: number;

  @Prop({ type: Number })
  wind_direction_10m?: number;

  @Prop({ type: Number })
  wind_gusts_10m?: number;

  @Prop({ type: Number })
  precipitation_probability?: number;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índices para melhor performance
WeatherLogSchema.index({ timestamp: -1, city: 1 });
WeatherLogSchema.index({ createdAt: -1 });

