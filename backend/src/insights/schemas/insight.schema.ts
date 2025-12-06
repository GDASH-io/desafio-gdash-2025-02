import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum InsightType {
  ALERT = 'alert',
  TREND = 'trend',
  SUMMARY = 'summary',
  RECOMMENDATION = 'recommendation',
}

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
}

@Schema({ timestamps: true })
export class Insight extends Document {
  @Prop({ required: true, enum: InsightType })
  type: InsightType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: InsightSeverity })
  severity: InsightSeverity;

  @Prop({ type: Object })
  metadata?: {
    startDate?: Date;
    endDate?: Date;
    dataPointsAnalyzed?: number;
    avgTemperature?: number;
    avgHumidity?: number;
  };

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);