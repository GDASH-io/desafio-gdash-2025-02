import { Schema, Document } from 'mongoose';

export interface User extends Document {
	username: string;
	passwordHash: string;
	role: 'admin' | 'user';
}

export const UserSchema = new Schema<User>({
	username: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ['admin', 'user'], default: 'user' },
});
