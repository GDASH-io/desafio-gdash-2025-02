import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { InsightSeverityEnum, InsightTypeEnum } from '@repo/shared'
import { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'insights' })
export class Insight extends Document {
  @Prop({ type: String, enum: InsightTypeEnum, required: true })
  type: InsightTypeEnum

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ type: String, enum: InsightSeverityEnum, required: true })
  severity: InsightSeverityEnum

  @Prop({ type: Object })
  data?: Record<string, unknown>

  @Prop({ required: true })
  generatedAt: Date

  createdAt: Date
  updatedAt: Date
}

export const InsightSchema = SchemaFactory.createForClass(Insight)
