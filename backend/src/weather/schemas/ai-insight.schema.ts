import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'ai_insights' })
export class AiInsight {
    @Prop()
    aiSummary?: string;

    @Prop()
    message?: string;

    @Prop()
    model?: string;

    @Prop()
    windowHours?: number;

    @Prop()
    samples?: number;

    @Prop({ type: Object })
    comfortRanking?: Record<string, unknown>[];

    @Prop({ type: Object })
    cities?: Record<string, unknown>[];
}

export type AiInsightDocument = AiInsight & Document;
export const AiInsightSchema = SchemaFactory.createForClass(AiInsight);
