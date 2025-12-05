import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: any): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(email: string): Promise<(import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    findById(id: string): Promise<User>;
    update(id: string, updateData: any): Promise<User>;
    delete(id: string): Promise<void>;
}
