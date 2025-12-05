import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function(next) {
  const user = this as any; // Usamos 'any' aqui para simplificar o acesso aos campos do documento

  // Verifica se a senha foi modificada ou é nova
  if (user.isModified('password')) {
    // Hashing da senha
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});
