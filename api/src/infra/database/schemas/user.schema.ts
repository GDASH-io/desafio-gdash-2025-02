import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserSchema>;

@Schema({ collection: "users", timestamps: true })
export class UserSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ["admin", "user"], default: "user" })
  role: "admin" | "user";

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserModel = SchemaFactory.createForClass(UserSchema);

// Índice para busca por texto (name e email)
UserModel.index({ name: "text", email: "text" });
