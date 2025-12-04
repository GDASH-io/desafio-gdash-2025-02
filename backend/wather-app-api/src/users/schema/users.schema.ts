import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users extends Document{
    @Prop({required: true})
    name: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    password: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);