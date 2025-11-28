import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    latitude!: number;

    @Prop({ required: true })
    longitude!: number;

    @Prop({ default: 60 })
    intervalMinutes!: number;

    @Prop({ default: true })
    active!: boolean;
}

export const LocationSchema = SchemaFactory.createForClass(Location);