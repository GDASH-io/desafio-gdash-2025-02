import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
        user: import("./entities/user.entity").User;
    }>;
    getProfile(req: any): Promise<any>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
