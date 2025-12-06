import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDataDocument = ConfigData & Document;

@Schema({ timestamps: true })
export class ConfigData {
  @Prop({ required: true, default: 'Sao Paulo' })
  city: string;

  @Prop({ required: true, default: '-23.5505' })
  latitude: string;

  @Prop({ required: true, default: '-46.6333' })
  longitude: string;
}

export const ConfigDataSchema = SchemaFactory.createForClass(ConfigData);
