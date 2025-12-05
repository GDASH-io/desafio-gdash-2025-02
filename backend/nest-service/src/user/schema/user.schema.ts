import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UserDocument = User & Document

@Schema({timestamps: true, collection: "users"})
export class User extends Document {

  @Prop({required: true})
  name: string;

  @Prop({required: true, unique: true})
  email: string

  @Prop({required: true})
  passwordHash: string

  @Prop({required: true, default: false})
  isAdmin: boolean;

  @Prop({required: true})
  tokenVersion: number
}

export const UserSchema = SchemaFactory.createForClass(User);