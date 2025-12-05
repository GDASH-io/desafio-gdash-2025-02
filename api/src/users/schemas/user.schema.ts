import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ default: 'user' })
  role: 'admin' | 'user';

  @Prop({ default: true })
  is_active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
