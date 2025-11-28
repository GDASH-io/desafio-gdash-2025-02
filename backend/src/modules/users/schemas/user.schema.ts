import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Será salvo como Hash (não texto puro)

  @Prop({ required: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);