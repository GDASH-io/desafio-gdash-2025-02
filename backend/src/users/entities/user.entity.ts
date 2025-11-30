import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false }) // select: false esconde a senha nas buscas normais
  password: string;

  @Prop({ default: 'user' }) // admin ou user
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
