import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'admin' | 'user';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role!: UserRole;

  // timestamps adicionados pelo @Schema({ timestamps: true })
  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
