import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: Partial<User>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findOne(email: string): Promise<UserDocument | null>;
    findAll(): Promise<User[]>;
    update(id: string, updateUserDto: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
}
