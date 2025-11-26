import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InsightDocument = Insight & Document;

@Schema({ timestamps: true, collection: 'insights_cache' })
export class Insight {
  @Prop({ required: true, type: Date, index: true })
  period_from: Date;

  @Prop({ required: true, type: Date, index: true })
  period_to: Date;

  @Prop({ type: [String], default: [] })
  types: string[];

  @Prop({ type: Object, required: true })
  pv_metrics: {
    soiling_risk?: {
      level: string;
      score: number;
      message: string;
      accumulated_precipitation_mm?: number;
    };
    consecutive_cloudy_days?: {
      consecutive_days: number;
      estimated_reduction_pct: number;
      message: string;
    };
    heat_derating?: {
      temp_c: number;
      derating_pct: number;
      message: string;
    };
    wind_derating?: {
      wind_speed_m_s: number;
      risk_level: string;
      message: string;
    };
    estimated_production_pct: number;
    estimated_production_kwh?: number;
  };

  @Prop({ type: Object })
  statistics: {
    avg_temp: number;
    avg_humidity: number;
    min_temp?: number;
    max_temp?: number;
    std_dev_temp?: number;
    trend: 'rising' | 'falling' | 'stable';
    slope?: number;
    classification: string;
  };

  @Prop({ type: Array, default: [] })
  alerts: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;

  @Prop({ type: String })
  summary: string;

  @Prop({ type: Object })
  scores: {
    comfort_score: number;
    pv_production_score: number;
  };

  @Prop({ type: Date, default: Date.now })
  generated_at: Date;

  @Prop({ type: Date, required: true, index: { expireAfterSeconds: 3600 } })
  expires_at: Date;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);

// Índices para melhor performance
InsightSchema.index({ period_from: 1, period_to: 1, types: 1 });
InsightSchema.index({ expires_at: 1 }, { expireAfterSeconds: 3600 });

