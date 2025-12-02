import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegistryLogDocument = HydratedDocument<RegistryLog>;

@Schema({ timestamps: true, expireAfterSeconds: 604800 })
export class RegistryLog {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  duration: number; // em ms

  @Prop()
  ip: string;

  @Prop()
  userId: string; // Quem fez a requisição (se logado)

  @Prop()
  userEmail: string; // Email de quem fez (facilita leitura)
}
export const RegistryLogSchema = SchemaFactory.createForClass(RegistryLog);
