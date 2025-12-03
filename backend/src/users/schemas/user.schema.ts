import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role?: string;
  theme?: string;
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User implements IUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ enum: ['light', 'dark'], default: undefined })
  theme?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

