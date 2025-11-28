import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectorConfigDocument = CollectorConfig & Document;

@Schema({ timestamps: true })
export class CollectorConfig {
    @Prop({ default: 60 })
    collectIntervalMinutes!: number;
}

export const CollectorConfigSchema = SchemaFactory.createForClass(CollectorConfig);