import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // ✅ CORRETO
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  wind_speed: number;

  @Prop({ required: true })
  condition: string;

  @Prop()
  rain_probability?: number;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// 🆕 SCHEMA PARA CACHE DE INSIGHTS (30min)
export type WeatherInsightCacheDocument = WeatherInsightCache & Document;

@Schema()
export class WeatherInsightCache {
  @Prop({ required: true })
  insightText: string;

  @Prop({ required: true, type: Object })
  metadata: {
    avgTemp: number;
    avgHum: number;
    avgWind: number;
    classification: string;
    comfortScore: number;
    totalRecords: number;
    alerts: string[];
    rainHighRatio: number;
    trendText: string;
  };

  @Prop({ type: Date, default: Date.now })
  generatedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const WeatherInsightCacheSchema = SchemaFactory.createForClass(WeatherInsightCache);
