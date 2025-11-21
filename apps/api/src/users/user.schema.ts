import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserRoleEnum } from '@repo/shared'
import { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ type: String, enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
