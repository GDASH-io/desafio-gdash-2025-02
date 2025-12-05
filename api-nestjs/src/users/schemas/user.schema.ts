import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true }) // Email único
  email: string;

  @Prop({ required: true })
  password: string; // Será salva criptografada
}

export const UserSchema = SchemaFactory.createForClass(User);