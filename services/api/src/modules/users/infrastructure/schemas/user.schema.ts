import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    collection: 'users'
})
export class User {
    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];

    @Prop()
    lastLoginAt?: Date;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

UserSchema.set('toJSON', {
    transform: (doc, ret: Partial<User> & { _id?: mongoose.Types.ObjectId; __v?: number; password?: string; id?: string }) => {
        delete ret.password;
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id
        delete ret.__v;
        return ret;
    },
});