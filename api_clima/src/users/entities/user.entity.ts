import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    nome: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    senha: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
